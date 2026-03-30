/**
 * Standardized API response utility.
 *
 * Automatically injects:
 * - version (from env: API_VERSION)
 * - service (from env: SERVICE_NAME)
 * - environment (NODE_ENV)
 * - timestamp
 * - requestId
 * - traceId
 * - client info
 *
 * @param {Object} params
 * @param {import('express').Request} params.req
 * @param {import('express').Response} params.res
 * @param {number} [params.statusCode=200]
 * @param {boolean} [params.success=true]
 * @param {string} [params.message='']
 * @param {any} [params.data=null]
 * @param {Object} [params.error=null]
 * @param {Object} [params.meta={}]
 */
const sendResponse = ({
  req,
  res,
  statusCode = 200,
  success = true,
  message = '',
  data = null,
  error = null,
  pagination = null,
  meta = {},
}) => {
  const standardMeta = {
    version: process.env.API_VERSION || '1.0.0',
    service: process.env.SERVICE_NAME || 'unknown-service',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    requestId: req.requestId || '',
    traceId: req.traceId || '',
    client:
      req.client && typeof req.client === 'object' && req.client.constructor === Object
        ? req.client
        : {},
    pagination: pagination
  };

  if (statusCode === 204) {
    return res.status(204).send();
  }

  const response = {
    success,
    statusCode,
    message,
    data,
    error,
    meta: {
      ...standardMeta,
      ...meta
    }
  };

  return res.status(statusCode).json(response);
};

module.exports = sendResponse;
