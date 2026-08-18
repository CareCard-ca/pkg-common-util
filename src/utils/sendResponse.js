const createError = require('./createError');
const { ApiErrorType } = require('../lib/errorConstants');

const successCodeByStatus = {
  200: 'OK',
  201: 'CREATED',
};

const successMessageByStatus = {
  200: 'OK',
  201: 'Created',
};

function createMeta(req = {}, pagination = null, meta = {}) {
  const standardMeta = {
    version: process.env.API_VERSION || '1.0.0',
    service: process.env.SERVICE_NAME || 'unknown-service',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    requestId: req?.requestId || '',
    traceId: req?.traceId || '',
    client:
      req?.client && typeof req.client === 'object' && req.client.constructor === Object
        ? req.client
        : {},
    pagination,
  };

  return {
    ...standardMeta,
    ...meta,
  };
}

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
 * @param {string} [params.code]
 * @param {string} [params.message]
 * @param {any} [params.data=null]
 * @param {Object} [params.error=null]
 * @param {any} [params.details=null]
 * @param {Object} [params.pagination=null]
 * @param {Object} [params.meta={}]
 */
const sendResponse = ({
  req,
  res,
  statusCode = 200,
  success = true,
  code,
  message,
  data = null,
  error = null,
  details = null,
  pagination = null,
  meta = {},
}) => {
  if (statusCode === 204) {
    return res.status(204).send();
  }

  const status = success ? 'success' : 'error';
  const responseCode = code || (success ? successCodeByStatus[statusCode] || 'OK' : error?.code);
  const responseDetails = details ?? error?.details ?? null;
  const responseMessage =
    message ||
    (success ? successMessageByStatus[statusCode] || 'OK' : error?.message || 'Request failed');
  const responseError = success
    ? null
    : createError({
        code: responseCode || ApiErrorType.UNEXPECTED_ERROR,
        message: responseMessage,
        details: responseDetails,
        fields: error?.fields ?? null,
      });

  const response = {
    success,
    status,
    statusCode,
    code: responseCode || (success ? 'OK' : ApiErrorType.UNEXPECTED_ERROR),
    message: responseMessage || '',
    data,
    error: responseError,
    details: responseDetails,
    meta: createMeta(req, pagination, meta),
  };

  return res.status(statusCode).json(response);
};

module.exports = sendResponse;
