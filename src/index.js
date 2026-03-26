const requestContext = require('./middleware/requestContext');
const sendResponse = require('./utils/sendResponse');
const createError = require('./utils/createError');
const utilityFunctions = require('./lib/utilityFunctions');
const appErrorHandlers = require('./lib/appErrorHandlers');
const responseStatus = require('./lib/responseStatus');
const errorConstants = require('./lib/errorConstants');
const errorUtils = require('./lib/errorUtils');

module.exports = {
  // Nested exports (Legacy/Deprecated)
  util: utilityFunctions,
  error: appErrorHandlers,
  resCode: responseStatus,

  // Direct top-level exports
  ...utilityFunctions,
  ...appErrorHandlers,
  ...responseStatus,

  // Core utilities
  requestContext,
  sendResponse,
  createError,

  // Error system
  ApiErrorType: errorConstants.ApiErrorType,
  getApiErrorMessage: errorUtils.getApiErrorMessage
};
