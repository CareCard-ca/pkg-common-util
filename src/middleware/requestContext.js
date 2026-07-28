const { randomUUID } = require('crypto');
const {
  createRequestTraceMetadata,
  formatTraceparent,
  runWithTraceMetadata
} = require('../lib/traceContext');

/**
 * Express middleware to generate and attach request context.
 *
 * Generates a service-owned requestId (UUID v4)
 * Continues or creates W3C trace context
 * Reads appId from header 'x-app-id'
 * Extracts client IP
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const requestContext = (req, res, next) => {
  req.requestId = randomUUID();

  const traceMetadata = createRequestTraceMetadata(getHeader(req, 'traceparent'));
  req.traceId = traceMetadata.traceId;
  req.spanId = traceMetadata.spanId;
  req.parentSpanId = traceMetadata.parentSpanId;
  req.traceFlags = traceMetadata.traceFlags;

  const appId = req.headers['x-app-id'];
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  req.client = {
    appId,
    ip
  };

  if (typeof res?.setHeader === 'function') {
    res.setHeader('traceparent', formatTraceparent(traceMetadata));
  }

  runWithTraceMetadata(traceMetadata, next);
};

function getHeader(req, headerName) {
  if (typeof req?.get === 'function') {
    return req.get(headerName);
  }

  return req?.headers?.[headerName.toLowerCase()];
}

module.exports = requestContext;
