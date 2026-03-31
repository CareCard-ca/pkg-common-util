'use strict';

const sendResponse = require('../utils/sendResponse');
const createError = require('../utils/createError');
const { ApiErrorType } = require('./errorConstants');

/**
 * These are application level error handlers. All error responses should be send using these functions.
 * These should be use in app.js file, not in controller files.
 */
module.exports = {
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
  throwBadVisitorTokenError: throwVisitorTokenError,
  throwFileFormatNotSupportedError,
  throwNotAuthorizedError,
  throwBadInputError,
  throwInputNotUuidError,
  throwFileTooLargeError,
  throwInvalidTimeValueError
};

function notFound404(req, res, next) {
  return sendResponse({
    req,
    res,
    statusCode: 404,
    success: false,
    message: 'Not found',
    error: createError({
      code: ApiErrorType.NOT_FOUND,
      message: 'Not found',
      details: null
    })
  });
}

function appErrorHandler(err, req, res, next) {
  const errorMessage = err?.message || 'Internal Server Error';
  const errorCode = err?.code;
  let statusCode;

  switch (errorCode || err?.message) {
    case 'Account_Suspended':
    case 'Account_Blocked':
    case 'Account_Inactive':
    case ApiErrorType.ACCOUNT_SUSPENDED:
    case ApiErrorType.ACCOUNT_BLOCKED:
    case ApiErrorType.ACCOUNT_INACTIVE:
    case 'Invalid time value':
    case ApiErrorType.INVALID_TIME_VALUE:
    case '42501':
      statusCode = 403;
      break;

    case 'Validation_Failure':
    case 'Used_Token':
    case 'Wrong_Credentials':
    case 'Bad_Visitor_Token':
    case 'Login_Required':
    case 'Not_Authorized':
    case ApiErrorType.VALIDATION_FAILURE:
    case ApiErrorType.USED_TOKEN:
    case ApiErrorType.WRONG_CREDENTIALS:
    case ApiErrorType.BAD_VISITOR_TOKEN:
    case ApiErrorType.LOGIN_REQUIRED:
    case ApiErrorType.NOT_AUTHORIZED:
      statusCode = 401;
      break;

    case 'Record_NotSaved':
    case 'Update_Failed':
    case 'Transaction_Failed':
    case 'Bad_Input':
    case 'Input_Not_Uuid':
    case ApiErrorType.RECORD_NOT_SAVED:
    case ApiErrorType.UPDATE_FAILED:
    case ApiErrorType.TRANSACTION_FAILED:
    case ApiErrorType.BAD_INPUT:
    case ApiErrorType.INPUT_NOT_UUID:
      statusCode = 400;
      break;

    case 'Record_Exist':
    case ApiErrorType.RECORD_EXIST:
      statusCode = 409;
      break;

    case 'Record_NotFound':
    case 'Not found':
    case ApiErrorType.RECORD_NOT_FOUND:
    case ApiErrorType.NOT_FOUND:
      statusCode = 404;
      break;

    case 'File_Format_Not_Supported':
    case ApiErrorType.FILE_FORMAT_NOT_SUPPORTED:
      statusCode = 415;
      break;

    case 'File too large':
    case ApiErrorType.FILE_TOO_LARGE:
      statusCode = 413;
      break;

    case ApiErrorType.RECORD_SAVE_FAILURE:
    case ApiErrorType.APPLICATION_ERROR:
    case ApiErrorType.NETWORK_ERROR:
    case ApiErrorType.UNEXPECTED_ERROR:
      statusCode = 500;
      break;

    default:
      statusCode = 500;
  }

  return sendResponse({
    req,
    res,
    statusCode,
    success: false,
    message: errorMessage,
    error: createError({
      code: err?.code ?? null,
      message: err?.userMessage ?? null,
      details: err?.details ?? null
    })
  });
}

function throwAccountSuspendedError(params = {}) {
  const error = new Error('Account_Suspended');
  error.code = ApiErrorType.ACCOUNT_SUSPENDED;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwAccountBlockedError(params = {}) {
  const error = new Error('Account_Blocked');
  error.code = ApiErrorType.ACCOUNT_BLOCKED;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwAccountInactiveError(params = {}) {
  const error = new Error('Account_Inactive');
  error.code = ApiErrorType.ACCOUNT_INACTIVE;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwValidationFailureError(params = {}) {
  const error = new Error('Validation_Failure');
  error.code = ApiErrorType.VALIDATION_FAILURE;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwWrongCredentialsError(params = {}) {
  const error = new Error('Wrong_Credentials');
  error.code = ApiErrorType.WRONG_CREDENTIALS;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwRecordExistError(params = {}) {
  const error = new Error('Record_Exist');
  error.code = ApiErrorType.RECORD_EXIST;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwRecordNotFoundError(params = {}) {
  const error = new Error('Record_NotFound');
  error.code = ApiErrorType.RECORD_NOT_FOUND;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwRecordNotSavedError(params = {}) {
  const error = new Error('Record_NotSaved');
  error.code = ApiErrorType.RECORD_NOT_SAVED;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwLoginRequiredError(params = {}) {
  const error = new Error('Login_Required');
  error.code = ApiErrorType.LOGIN_REQUIRED;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwUpdateFailedError(params = {}) {
  const error = new Error('Update_Failed');
  error.code = ApiErrorType.UPDATE_FAILED;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwTransactionFailedError(params = {}) {
  const error = new Error('Transaction_Failed');
  error.code = ApiErrorType.TRANSACTION_FAILED;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwUsedTokenError(params = {}) {
  const error = new Error('Used_Token');
  error.code = ApiErrorType.USED_TOKEN;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwVisitorTokenError(params = {}) {
  const error = new Error('Bad_Visitor_Token');
  error.code = ApiErrorType.BAD_VISITOR_TOKEN;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwFileFormatNotSupportedError(params = {}) {
  const error = new Error('File_Format_Not_Supported');
  error.code = ApiErrorType.FILE_FORMAT_NOT_SUPPORTED;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwNotAuthorizedError(params = {}) {
  const error = new Error('Not_Authorized');
  error.code = ApiErrorType.NOT_AUTHORIZED;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwBadInputError(params = {}) {
  const error = new Error('Bad_Input');
  error.code = ApiErrorType.BAD_INPUT;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwInputNotUuidError(params = {}) {
  const error = new Error('Input_Not_Uuid');
  error.code = ApiErrorType.INPUT_NOT_UUID;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwFileTooLargeError(params = {}) {
  const error = new Error('File too large');
  error.code = ApiErrorType.FILE_TOO_LARGE;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwInvalidTimeValueError(params = {}) {
  const error = new Error('Invalid time value');
  error.code = ApiErrorType.INVALID_TIME_VALUE;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwNotFoundError(params = {}) {
  const error = new Error('Not found');
  error.code = ApiErrorType.NOT_FOUND;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwRecordSaveFailureError(params = {}) {
  const error = new Error('Record_Save_Failure');
  error.code = ApiErrorType.RECORD_SAVE_FAILURE;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwApplicationError(params = {}) {
  const error = new Error('Application_Error');
  error.code = ApiErrorType.APPLICATION_ERROR;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwNetworkError(params = {}) {
  const error = new Error('Network_Error');
  error.code = ApiErrorType.NETWORK_ERROR;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwUnexpectedError(params = {}) {
  const error = new Error('Unexpected_Error');
  error.code = ApiErrorType.UNEXPECTED_ERROR;
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}
