import commonUtil from './index.js';

export const {
  // Legacy objects
  util,
  error,
  resCode,
  caseConverter,

  // Top-level utility functions
  extractObjectWithProperties,
  keysToCamelCase,
  keysToSnakeCase,

  // Top-level error handlers/throwers
  throwAccountSuspendedError,
  throwAccountBlockedError,
  throwAccountInactiveError,
  throwNotFoundError,
  throwRecordSaveFailureError,
  throwApplicationError,
  throwNetworkError,
  throwUnexpectedError,
  notFound404,
  appErrorHandler,
  throwValidationFailureError,
  throwRecordExistError,
  throwWrongCredentialsError,
  throwLoginRequiredError,
  throwRecordNotFoundError,
  throwRecordNotSavedError,
  throwUpdateFailedError,
  throwTransactionFailedError,
  throwUsedTokenError,
  throwBadVisitorTokenError,
  throwFileFormatNotSupportedError,
  throwNotAuthorizedError,
  throwBadInputError,
  throwInputNotUuidError,
  throwFileTooLargeError,
  throwInvalidTimeValueError,

  // Top-level response status functions
  setOk200,
  setCreated201,
  setBadRequest400ClientError,

  // Core functions
  requestContext,
  createTracePropagationHeaders,
  getActiveTraceMetadata,
  sendResponse,
  createError,

  // Constants and utils
  ApiErrorType,
  getApiErrorMessage
} = commonUtil;

export default commonUtil;
