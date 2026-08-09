'use strict';

const http = require('http');

// Pattern: Error Normalization - retains non-Error rejection values as an explicit cause.
function normalizeError(error) {
  return error instanceof Error
    ? error
    : new Error('Operation failed with a non-Error value.', { cause: error });
}

// Pattern: Data Minimization - records only the method and query-free path needed for leak diagnostics.
function getSafeRequestDescription(request) {
  const method = typeof request.method === 'string' ? request.method : 'UNKNOWN';
  const rawUrl = typeof request.url === 'string' ? request.url : '/';

  try {
    return `${method} ${new URL(rawUrl, 'http://127.0.0.1').pathname || '/'}`;
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    return `${method} ${rawUrl.split('?')[0] || '/'}`;
  }
}

// Pattern: Bounded Outcome - observes fulfillment and rejection while enforcing a real deadline.
async function getPromiseOutcomeBeforeDeadline(operation, timeoutMs) {
  let deadline;
  const operationOutcome = operation.then(
    () => ({ status: 'fulfilled' }),
    (error) => ({ status: 'rejected', error: normalizeError(error) })
  );
  const deadlineReached = new Promise((resolve) => {
    deadline = setTimeout(() => resolve({ status: 'timed-out' }), timeoutMs);
  });

  try {
    return await Promise.race([operationOutcome, deadlineReached]);
  } finally {
    clearTimeout(deadline);
  }
}

// Pattern: Configuration Guard - rejects invalid bounds instead of silently disabling fail-fast behavior.
function requirePositiveTimeout(timeoutName, timeoutMs) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new RangeError(`${timeoutName} must be a positive number of milliseconds.`);
  }
}

// Pattern: Diagnostic Error - reports actionable resource ownership without leaking query parameters.
function createForcedCleanupError(cleanupTiming, requestDescriptions, socketCount) {
  const requestLabel = requestDescriptions.length === 1 ? 'request' : 'requests';
  const socketLabel = socketCount === 1 ? 'socket' : 'sockets';
  const requests = requestDescriptions.length > 0 ? requestDescriptions.join(', ') : 'none';

  return new Error(
    `Managed HTTP test server forced cleanup ${cleanupTiming} with ${requestDescriptions.length} unfinished ${requestLabel}: ${requests}; ${socketCount} open ${socketLabel}.`
  );
}

// Pattern: Error Preservation - reports every independent teardown failure without hiding the first cause.
function createCombinedFailure(failures) {
  const uniqueFailures = [...new Set(failures)];
  if (uniqueFailures.length === 1) return uniqueFailures[0];

  return new AggregateError(
    uniqueFailures,
    uniqueFailures.map((error) => error.message).join(' | ')
  );
}

// Pattern: Resource Owner - gives integration suites one explicit, fail-closed HTTP server lifecycle.
function createManagedHttpTestServer(
  requestListener,
  { shutdownGracePeriodMs = 1000, forcedCleanupTimeoutMs = 250 } = {}
) {
  requirePositiveTimeout('shutdownGracePeriodMs', shutdownGracePeriodMs);
  requirePositiveTimeout('forcedCleanupTimeoutMs', forcedCleanupTimeoutMs);

  const activeRequests = new Set();
  const sockets = new Set();
  let stopOperation;

  // Pattern: Request Accounting - retains each in-flight request until its response finishes or closes.
  function trackRequest(request, response) {
    const activeRequest = { description: getSafeRequestDescription(request) };
    activeRequests.add(activeRequest);

    // Pattern: Idempotent Cleanup - releases request ownership on either successful finish or disconnect.
    function releaseRequest() {
      activeRequests.delete(activeRequest);
    }

    response.once('finish', releaseRequest);
    response.once('close', releaseRequest);
    requestListener(request, response);
  }

  const server = http.createServer(trackRequest);

  // Pattern: Connection Accounting - makes lingering sockets visible to deterministic teardown.
  function trackConnection(socket) {
    sockets.add(socket);

    // Pattern: Resource Cleanup - releases closed sockets from the ownership set.
    function releaseSocket() {
      sockets.delete(socket);
    }

    socket.once('close', releaseSocket);
  }

  server.on('connection', trackConnection);

  // Pattern: Idempotent Lifecycle - starts the server only when it is not already listening.
  async function start() {
    if (server.listening) return;
    if (stopOperation) {
      await stopOperation;
      stopOperation = undefined;
    }

    await new Promise((resolve, reject) => {
      // Pattern: Event Cleanup - removes the temporary startup error listener after a successful bind.
      function handleListening() {
        server.off('error', reject);
        resolve();
      }

      server.once('error', reject);
      server.listen(0, '127.0.0.1', handleListening);
    });
  }

  // Pattern: Bounded Forced Cleanup - attempts every cleanup path and returns all resulting failures.
  async function forceClose(serverClosed, openSockets) {
    const cleanupFailures = [];

    try {
      server.closeAllConnections();
    } catch (error) {
      cleanupFailures.push(normalizeError(error));
    }

    for (const socket of openSockets) {
      try {
        socket.destroy();
      } catch (error) {
        cleanupFailures.push(normalizeError(error));
      }
    }

    const forcedCloseOutcome = await getPromiseOutcomeBeforeDeadline(
      serverClosed,
      forcedCleanupTimeoutMs
    );
    if (forcedCloseOutcome.status === 'rejected') {
      cleanupFailures.push(forcedCloseOutcome.error);
    } else if (forcedCloseOutcome.status === 'timed-out') {
      cleanupFailures.push(
        new Error(
          `Managed HTTP test server forced cleanup did not complete within ${forcedCleanupTimeoutMs}ms.`
        )
      );
    }

    return cleanupFailures;
  }

  // Pattern: Fail-Closed Cleanup - terminates leaked resources but still fails the owning test suite.
  async function performStop() {
    const shutdownFailures = [];

    const serverClosed = new Promise((resolve, reject) => {
      // Pattern: Error Propagation - preserves shutdown failures instead of converting them into passes.
      function handleServerClose(error) {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      }

      server.close(handleServerClose);
    });

    try {
      server.closeIdleConnections();
    } catch (error) {
      shutdownFailures.push(normalizeError(error));
    }

    const requestDescriptions = [...activeRequests].map(({ description }) => description);
    const openSockets = [...sockets];
    if (requestDescriptions.length > 0) {
      shutdownFailures.push(
        createForcedCleanupError('immediately', requestDescriptions, openSockets.length)
      );
    }

    if (shutdownFailures.length === 0) {
      const gracefulCloseOutcome = await getPromiseOutcomeBeforeDeadline(
        serverClosed,
        shutdownGracePeriodMs
      );
      if (gracefulCloseOutcome.status === 'fulfilled') return;
      if (gracefulCloseOutcome.status === 'rejected') {
        shutdownFailures.push(gracefulCloseOutcome.error);
      } else {
        shutdownFailures.push(
          createForcedCleanupError(
            `after ${shutdownGracePeriodMs}ms`,
            [...activeRequests].map(({ description }) => description),
            sockets.size
          )
        );
      }
    }

    const cleanupFailures = await forceClose(serverClosed, openSockets);
    throw createCombinedFailure([...shutdownFailures, ...cleanupFailures]);
  }

  // Pattern: Shared Stop Outcome - every concurrent caller observes the same success or failure.
  function stop() {
    if (stopOperation) return stopOperation;
    if (!server.listening) return Promise.resolve();

    stopOperation = performStop();
    return stopOperation;
  }

  // Pattern: Encapsulation - exposes the owned server without leaking lifecycle mutation.
  function getServer() {
    return server;
  }

  return {
    getServer,
    start,
    stop
  };
}

module.exports = {
  createManagedHttpTestServer
};
