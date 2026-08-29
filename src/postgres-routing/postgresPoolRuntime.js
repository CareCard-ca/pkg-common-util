'use strict';

const ACQUIRE_DURATION_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2];
const CLIENT_RELEASE_TRACKERS = new WeakMap();
const POOL_ERROR_SOURCES = new Set(['idle', 'listener']);

// Pattern: Runtime State - owns counters and checked-out clients for one process-local pool.
function createRuntimeState(options) {
  return {
    ...options,
    acquireDurationBuckets: new Map(ACQUIRE_DURATION_BUCKETS.map(bucket => [bucket, 0])),
    acquireDurationCount: 0,
    acquireDurationSum: 0,
    acquireFailures: 0,
    checkedOutClients: new Set(),
    closePromise: undefined,
    connectionsOpened: 0,
    connectionsRemoved: 0,
    errors: { idle: 0, listener: 0 },
    listenerConnected: undefined,
    listenerReconnectAttempts: 0,
    markError: options.markError ?? (error => error),
    observerFailures: 0,
  };
}

// Pattern: Observer Registration - attaches non-fatal pool lifecycle accounting once.
function registerPoolObservers(state) {
  state.pool.on('connect', client => handlePoolConnection(state, client));
  state.pool.on('error', error => handlePoolError(state, error));
  state.pool.on('remove', () => handlePoolRemoval(state));
}

// Pattern: Event Observer - records a new physical connection.
function handlePoolConnection(state, client) {
  state.connectionsOpened += 1;
  notifyPoolObserver(state, state.onConnect, client);
}

// Pattern: Resilience Boundary - marks and reports an idle pool error without exiting.
function handlePoolError(state, error) {
  recordPoolError(state, 'idle', error);
  notifyPoolObserver(state, state.onPoolError, error);
}

// Pattern: Event Observer - records a removed physical connection.
function handlePoolRemoval(state) {
  state.connectionsRemoved += 1;
  notifyPoolObserver(state, state.onRemove);
}

// Pattern: Result Capture - represents a synchronous boundary failure explicitly.
function captureSynchronousOperation(operation) {
  try {
    return { failed: false, value: operation() };
  } catch (error) {
    return { error, failed: true };
  }
}

// Pattern: Fault Isolation - observer failures cannot turn recoverable pool events into process errors.
function notifyPoolObserver(state, observer, ...values) {
  if (!observer) {
    return;
  }
  const result = captureSynchronousOperation(() => observer(...values));
  if (result.failed) {
    state.observerFailures += 1;
  }
}

// Pattern: Timed Acquisition - measures the complete wait, connect, and session-init boundary.
async function acquireClient(state, initializeClient) {
  const startedAt = process.hrtime.bigint();
  let client;
  try {
    client = await state.pool.connect();
    trackCheckedOutClient(state, client);
    const initializedClient = await initializeClient(client);
    observeAcquireDuration(state, startedAt);
    return initializedClient;
  } catch (error) {
    state.acquireFailures += 1;
    observeAcquireDuration(state, startedAt);
    state.markError(error);
    if (client) {
      destroyClient(client);
    }
    throw error;
  }
}

// Pattern: Ownership Tracking - removes a client from shutdown ownership when it is released.
function trackCheckedOutClient(state, client) {
  const tracker = getClientReleaseTracker(client);
  tracker.state = state;
  state.checkedOutClients.add(client);
}

// Pattern: Idempotent Decorator - installs one release wrapper per physical pg client.
function getClientReleaseTracker(client) {
  let tracker = CLIENT_RELEASE_TRACKERS.get(client);
  if (tracker) {
    return tracker;
  }
  tracker = { client, releaseClient: client.release.bind(client), state: undefined };
  client.release = destroy => {
    tracker.state?.checkedOutClients.delete(client);
    tracker.state = undefined;
    return tracker.releaseClient(destroy);
  };
  CLIENT_RELEASE_TRACKERS.set(client, tracker);
  return tracker;
}

// Pattern: Failure Cleanup - destroys a client whose acquisition or session setup failed.
function destroyClient(client) {
  return !captureSynchronousOperation(() => client.release(true)).failed;
}

// Pattern: Histogram Recorder - updates cumulative Prometheus acquisition buckets.
function observeAcquireDuration(state, startedAt) {
  const duration = Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
  state.acquireDurationCount += 1;
  state.acquireDurationSum += duration;
  for (const bucket of ACQUIRE_DURATION_BUCKETS) {
    if (duration <= bucket) {
      state.acquireDurationBuckets.set(bucket, state.acquireDurationBuckets.get(bucket) + 1);
    }
  }
}

// Pattern: Idempotent Close - shares one pool shutdown promise across every lifecycle caller.
function closePool(state) {
  if (!state.closePromise) {
    state.closePromise = Promise.resolve()
      .then(() => state.pool.end())
      .catch(error => {
        throw state.markError(error);
      });
  }
  return state.closePromise;
}

// Pattern: Forced Cleanup - destroys only clients still checked out from this pool.
function forceCloseCheckedOutClients(state) {
  const clients = [...state.checkedOutClients];
  for (const client of clients) {
    destroyClient(client);
  }
  return clients.length;
}

// Pattern: Bounded Counter - records only allowlisted PostgreSQL error sources.
function recordPoolError(state, source, error) {
  if (!POOL_ERROR_SOURCES.has(source)) {
    throw new TypeError('Unsupported PostgreSQL error source');
  }
  state.markError(error);
  state.errors[source] += 1;
}

// Pattern: Listener State - exposes the readiness-relevant state of a dedicated LISTEN client.
function setListenerConnected(state, connected) {
  state.listenerConnected = connected ? 1 : 0;
}

// Pattern: Listener Counter - records each scheduled LISTEN reconnection attempt.
function recordListenerReconnectAttempt(state) {
  state.listenerReconnectAttempts += 1;
}

// Pattern: Metrics Projection - exposes current pg pool gauges without sensitive labels.
function renderConnectionMetrics(state) {
  const label = `service="${state.serviceName}"`;
  const total = state.pool.totalCount;
  const idle = state.pool.idleCount;
  return [
    '# HELP carecard_postgres_pool_connections Current PostgreSQL pool connections by state.',
    '# TYPE carecard_postgres_pool_connections gauge',
    `carecard_postgres_pool_connections{${label},state="total"} ${total}`,
    `carecard_postgres_pool_connections{${label},state="idle"} ${idle}`,
    `carecard_postgres_pool_connections{${label},state="active"} ${Math.max(0, total - idle)}`,
    '# HELP carecard_postgres_pool_max_connections Configured PostgreSQL pool maximum.',
    '# TYPE carecard_postgres_pool_max_connections gauge',
    `carecard_postgres_pool_max_connections{${label}} ${state.maximum}`,
    '# HELP carecard_postgres_pool_waiting_clients Clients waiting for a PostgreSQL connection.',
    '# TYPE carecard_postgres_pool_waiting_clients gauge',
    `carecard_postgres_pool_waiting_clients{${label}} ${state.pool.waitingCount}`,
  ];
}

// Pattern: Metrics Projection - exposes bounded connection and failure counters.
function renderCounterMetrics(state) {
  const label = `service="${state.serviceName}"`;
  return [
    '# HELP carecard_postgres_pool_connections_opened_total Physical PostgreSQL connections opened.',
    '# TYPE carecard_postgres_pool_connections_opened_total counter',
    `carecard_postgres_pool_connections_opened_total{${label}} ${state.connectionsOpened}`,
    '# HELP carecard_postgres_pool_connections_removed_total Physical PostgreSQL connections removed.',
    '# TYPE carecard_postgres_pool_connections_removed_total counter',
    `carecard_postgres_pool_connections_removed_total{${label}} ${state.connectionsRemoved}`,
    '# HELP carecard_postgres_pool_errors_total PostgreSQL pool and listener errors.',
    '# TYPE carecard_postgres_pool_errors_total counter',
    `carecard_postgres_pool_errors_total{${label},source="idle"} ${state.errors.idle}`,
    `carecard_postgres_pool_errors_total{${label},source="listener"} ${state.errors.listener}`,
    '# HELP carecard_postgres_pool_acquire_failures_total Failed PostgreSQL pool acquisitions.',
    '# TYPE carecard_postgres_pool_acquire_failures_total counter',
    `carecard_postgres_pool_acquire_failures_total{${label}} ${state.acquireFailures}`,
    '# HELP carecard_postgres_pool_observer_failures_total Failed pool diagnostic observers.',
    '# TYPE carecard_postgres_pool_observer_failures_total counter',
    `carecard_postgres_pool_observer_failures_total{${label}} ${state.observerFailures}`,
  ];
}

// Pattern: Metrics Projection - renders cumulative acquisition duration histogram buckets.
function renderAcquireMetrics(state) {
  const label = `service="${state.serviceName}"`;
  const lines = [
    '# HELP carecard_postgres_pool_acquire_duration_seconds PostgreSQL acquisition duration.',
    '# TYPE carecard_postgres_pool_acquire_duration_seconds histogram',
  ];
  for (const bucket of ACQUIRE_DURATION_BUCKETS) {
    lines.push(
      `carecard_postgres_pool_acquire_duration_seconds_bucket{${label},le="${bucket}"} ${state.acquireDurationBuckets.get(bucket)}`,
    );
  }
  lines.push(
    `carecard_postgres_pool_acquire_duration_seconds_bucket{${label},le="+Inf"} ${state.acquireDurationCount}`,
    `carecard_postgres_pool_acquire_duration_seconds_sum{${label}} ${formatMetricNumber(state.acquireDurationSum)}`,
    `carecard_postgres_pool_acquire_duration_seconds_count{${label}} ${state.acquireDurationCount}`,
  );
  return lines;
}

// Pattern: Optional Projection - exposes dedicated LISTEN state only after listener registration.
function renderListenerMetrics(state) {
  if (state.listenerConnected === undefined) {
    return [];
  }
  const label = `service="${state.serviceName}"`;
  return [
    '# HELP carecard_postgres_listener_connected Whether the PostgreSQL LISTEN client is connected.',
    '# TYPE carecard_postgres_listener_connected gauge',
    `carecard_postgres_listener_connected{${label}} ${state.listenerConnected}`,
    '# HELP carecard_postgres_listener_reconnect_attempts_total PostgreSQL LISTEN reconnect attempts.',
    '# TYPE carecard_postgres_listener_reconnect_attempts_total counter',
    `carecard_postgres_listener_reconnect_attempts_total{${label}} ${state.listenerReconnectAttempts}`,
  ];
}

// Pattern: Stable Formatting - bounds floating-point metric precision.
function formatMetricNumber(value) {
  return Number.isFinite(value) ? Number(value.toFixed(6)).toString() : '0';
}

// Pattern: Metrics Facade - combines bounded runtime projections for one HTTP metrics endpoint.
function renderPostgresPoolMetrics(state) {
  return `${[
    ...renderConnectionMetrics(state),
    ...renderCounterMetrics(state),
    ...renderAcquireMetrics(state),
    ...renderListenerMetrics(state),
  ].join('\n')}\n`;
}

// Pattern: Facade - provides one lifecycle and instrumentation owner for a pg Pool.
function createPostgresPoolRuntime(options) {
  const state = createRuntimeState(options);
  registerPoolObservers(state);
  return {
    connect: initializeClient => acquireClient(state, initializeClient),
    endPool: () => closePool(state),
    forceCloseCheckedOutClients: () => forceCloseCheckedOutClients(state),
    getPoolMetrics: () => renderPostgresPoolMetrics(state),
    recordListenerError: error => recordPoolError(state, 'listener', error),
    recordListenerReconnectAttempt: () => recordListenerReconnectAttempt(state),
    setListenerConnected: connected => setListenerConnected(state, connected),
  };
}

module.exports = { createPostgresPoolRuntime };
