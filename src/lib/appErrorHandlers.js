'use strict';

const sendResponse = require('../utils/sendResponse');
const createError = require('../utils/createError');

/**
 * These are application level error handlers. All error responses should be send using these functions.
 * These should be use in app.js file, not in controller files.
 */
module.exports = {
  throwAccountSuspendedError,
  throwAccountBlockedError,
  throwAccountInactiveError,
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
      code: 'NOT_FOUND',
      message: 'Not found',
      details: null
    })
  });
}

function appErrorHandler(err, req, res, next) {
  let statusCode = 500;
  const errorMessage = err?.message || 'Internal Server Error';

  switch (err?.message) {
    case 'Account_Suspended':
    case 'Account_Blocked':
    case 'Account_Inactive':
      statusCode = 403;
      break;

    case 'Validation_Failure':
    case 'Used_Token':
    case 'Wrong_Credentials':
    case 'Bad_Visitor_Token':
    case 'Login_Required':
    case 'Not_Authorized':
      statusCode = 401;
      break;

    case 'Record_NotSaved':
    case 'Update_Failed':
    case 'Transaction_Failed':
    case 'Bad_Input':
    case 'Input_Not_Uuid':
      statusCode = 400;
      break;

    case 'Record_Exist':
      statusCode = 409;
      break;

    case 'Record_NotFound':
      statusCode = 404;
      break;

    case 'File_Format_Not_Supported':
      statusCode = 415;
      break;

    case 'File too large':
      statusCode = 413;
      break;

    case 'Invalid time value':
      statusCode = 403;
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
  error.code = 'ACCOUNT_SUSPENDED';
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwAccountBlockedError(params = {}) {
  const error = new Error('Account_Blocked');
  error.code = 'ACCOUNT_BLOCKED';
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwAccountInactiveError(params = {}) {
  const error = new Error('Account_Inactive');
  error.code = 'ACCOUNT_INACTIVE';
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwValidationFailureError(params = {}) {
  const error = new Error('Validation_Failure');
  error.code = 'VALIDATION_FAILURE';
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwWrongCredentialsError(params = {}) {
  const error = new Error('Wrong_Credentials');
  error.code = 'WRONG_CREDENTIALS';
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwRecordExistError(params = {}) {
  const error = new Error('Record_Exist');
  error.code = 'RECORD_EXIST';
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwRecordNotFoundError(params = {}) {
  const error = new Error('Record_NotFound');
  error.code = 'RECORD_NOT_FOUND';
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwRecordNotSavedError(params = {}) {
  const error = new Error('Record_NotSaved');
  error.code = 'RECORD_NOT_SAVED';
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwLoginRequiredError(params = {}) {
  const error = new Error('Login_Required');
  error.code = 'LOGIN_REQUIRED';
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwUpdateFailedError(params = {}) {
  const error = new Error('Update_Failed');
  error.code = 'UPDATE_FAILED';
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwTransactionFailedError(params = {}) {
  const error = new Error('Transaction_Failed');
  error.code = 'TRANSACTION_FAILED';
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwUsedTokenError(params = {}) {
  const error = new Error('Used_Token');
  error.code = 'USED_TOKEN';
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwVisitorTokenError(params = {}) {
  const error = new Error('Bad_Visitor_Token');
  error.code = 'BAD_VISITOR_TOKEN';
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwFileFormatNotSupportedError(params = {}) {
  const error = new Error('File_Format_Not_Supported');
  error.code = 'FILE_FORMAT_NOT_SUPPORTED';
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwNotAuthorizedError(params = {}) {
  const error = new Error('Not_Authorized');
  error.code = 'NOT_AUTHORIZED';
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwBadInputError(params = {}) {
  const error = new Error('Bad_Input');
  error.code = 'BAD_INPUT';
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwInputNotUuidError(params = {}) {
  const error = new Error('Input_Not_Uuid');
  error.code = 'INPUT_NOT_UUID';
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwFileTooLargeError(params = {}) {
  const error = new Error('File too large');
  error.code = 'FILE_TOO_LARGE';
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}

function throwInvalidTimeValueError(params = {}) {
  const error = new Error('Invalid time value');
  error.code = 'INVALID_TIME_VALUE';
  error.userMessage = params.userMessage ?? null;
  error.details = params.details ?? null;
  throw error;
}
