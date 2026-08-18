'use strict';

// Pattern: Middleware Factory - observes one HTTP lifecycle without logging request secrets.
function createHttpRequestLogger(logger, options = {}) {
  const nowMilliseconds = options.nowMilliseconds || Date.now;
  return (request, response, next) => {
    const startedAt = nowMilliseconds();
    response.once('finish', () =>
      recordCompletedRequest(logger, request, response.statusCode, nowMilliseconds() - startedAt),
    );
    next();
  };
}

// Pattern: Observer - emits one structured completion event at the matching severity.
function recordCompletedRequest(logger, request, statusCode, durationMs) {
  const metadata = logger.getRequestMetadata(request, {
    durationMs,
    operation: 'http.request.completed',
    statusCode,
  });
  if (statusCode >= 500) {
    logger.error('HTTP request failed', metadata);
  } else if (statusCode >= 400) {
    logger.warn('HTTP request completed with client error', metadata);
  } else {
    logger.info('HTTP request completed', metadata);
  }
}

module.exports = createHttpRequestLogger;
