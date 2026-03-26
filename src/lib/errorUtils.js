'use strict';

const { ApiErrorType } = require('./errorConstants');

/**
 * Extracts error message from standardized error data.
 *
 * @param {Object} errorData - The error data from API or legacy source.
 * @param {Function} t - Translation function (key => translated string).
 * @returns {string} The formatted error message.
 */
function getApiErrorMessage(errorData, t) {
  if (!errorData) {
    return t('errors.unexpected_error');
  }

  // Try to get message from direct field or nested error object
  let message;

  // Prefer nested error message if available
  if (errorData.error && typeof errorData.error === 'object' && errorData.error.message) {
    message = errorData.error.message;
  }

  // Fallback to top-level message
  if (!message && typeof errorData.message === 'string' && errorData.message) {
    message = errorData.message;
  }

  // Try to get error code
  let errorCode;
  if (errorData.error) {
    if (typeof errorData.error === 'string') {
      errorCode = errorData.error;
    } else if (typeof errorData.error === 'object' && errorData.error.code) {
      errorCode = errorData.error.code;
    }
  }

  // If we have a recognized error code, try to translate it first
  // Unless we have a message that doesn't look like an error code
  if (errorCode) {
    const translated = translateCode(errorCode, t);
    if (translated && translated !== errorCode && translated !== t('errors.unexpected_error')) {
      // If we have a translation, and it's not the code itself, return it
      // But wait, if the message is specific, we might still want it.
      // For now, let's just return the translated message if it's found.
      return translated;
    }
  }

  if (message) {
    return message;
  }

  if (!errorCode) {
    return t('errors.unexpected_error');
  }

  return translateCode(errorCode, t) || t('errors.unexpected_error');
}

/**
 * Helper to translate error code.
 * @param {string} errorCode
 * @param {Function} t
 * @returns {string|null}
 */
function translateCode(errorCode, t) {
  if (!errorCode) return null;
  const code = errorCode.toLowerCase();

  switch (code) {
    case ApiErrorType.VALIDATION_FAILURE.toLowerCase():
      return t('errors.validation_failure');

    case ApiErrorType.WRONG_CREDENTIALS.toLowerCase():
      return t('errors.wrong_credentials');

    case ApiErrorType.RECORD_NOT_FOUND.toLowerCase():
      return t('errors.record_not_found');

    case ApiErrorType.RECORD_NOT_SAVED.toLowerCase():
      return t('errors.record_not_saved');

    case ApiErrorType.RECORD_SAVE_FAILURE.toLowerCase():
      return t('errors.record_save_failure');

    case ApiErrorType.APPLICATION_ERROR.toLowerCase():
      return t('errors.application_error');

    case ApiErrorType.NOT_FOUND.toLowerCase():
      return t('errors.not_found');

    case ApiErrorType.LOGIN_REQUIRED.toLowerCase():
      return t('errors.login_required');

    case ApiErrorType.NETWORK_ERROR.toLowerCase():
      return t('errors.network_error');

    case ApiErrorType.ACCOUNT_SUSPENDED.toLowerCase():
      return t('errors.account_suspended');

    case ApiErrorType.ACCOUNT_BLOCKED.toLowerCase():
      return t('errors.account_blocked');

    case ApiErrorType.ACCOUNT_INACTIVE.toLowerCase():
      return t('errors.account_inactive');

    case ApiErrorType.RECORD_EXIST.toLowerCase():
      return t('errors.record_exist');

    case ApiErrorType.UPDATE_FAILED.toLowerCase():
      return t('errors.update_failed');

    case ApiErrorType.TRANSACTION_FAILED.toLowerCase():
      return t('errors.transaction_failed');

    case ApiErrorType.USED_TOKEN.toLowerCase():
      return t('errors.used_token');

    case ApiErrorType.BAD_VISITOR_TOKEN.toLowerCase():
      return t('errors.bad_visitor_token');

    case ApiErrorType.FILE_FORMAT_NOT_SUPPORTED.toLowerCase():
      return t('errors.file_format_not_supported');

    case ApiErrorType.NOT_AUTHORIZED.toLowerCase():
      return t('errors.not_authorized');

    case ApiErrorType.BAD_INPUT.toLowerCase():
      return t('errors.bad_input');

    case ApiErrorType.INPUT_NOT_UUID.toLowerCase():
      return t('errors.input_not_uuid');

    case ApiErrorType.FILE_TOO_LARGE.toLowerCase():
      return t('errors.file_too_large');

    case ApiErrorType.INVALID_TIME_VALUE.toLowerCase():
      return t('errors.invalid_time_value');

    case ApiErrorType.UNKNOWN_ERROR.toLowerCase():
      return t('errors.unknown_error');

    case ApiErrorType.PARSE_ERROR.toLowerCase():
      return t('errors.parse_error');

    case ApiErrorType.UNEXPECTED_ERROR.toLowerCase():
    default:
      return null;
  }
}

module.exports = {
  getApiErrorMessage
};
