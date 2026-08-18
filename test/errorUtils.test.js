'use strict';

const { describe, it } = require('mocha');
const assert = require('assert');
const { ApiErrorType, getApiErrorMessage } = require('../index');

describe('ErrorUtils', function () {
  const t = key => `translated_${key}`;

  describe('getApiErrorMessage', function () {
    it('should return unexpected error if errorData is null', function () {
      const result = getApiErrorMessage(null, t);
      assert.strictEqual(result, 'translated_errors.unexpected_error');
    });

    it('should return message from errorData.error.message if available', function () {
      const errorData = {
        error: {
          message: 'Direct error message',
        },
      };
      const result = getApiErrorMessage(errorData, t);
      assert.strictEqual(result, 'Direct error message');
    });

    it('should return translated message even if message is present in errorData.error', function () {
      const errorData = {
        error: {
          code: ApiErrorType.VALIDATION_FAILURE,
          message: 'Generic English Message',
        },
      };
      const result = getApiErrorMessage(errorData, t);
      assert.strictEqual(result, 'translated_errors.validation_failure');
    });
    it('should return message from errorData.error.message if code is unknown', function () {
      const errorData = {
        error: {
          code: 'UNKNOWN_CODE',
          message: 'Specific Backend Message',
        },
      };
      const result = getApiErrorMessage(errorData, t);
      assert.strictEqual(result, 'Specific Backend Message');
    });
    it('should return top-level message if errorData.error.message is not available', function () {
      const errorData = {
        message: 'Top-level message',
      };
      const result = getApiErrorMessage(errorData, t);
      assert.strictEqual(result, 'Top-level message');
    });

    it('should return translated message based on errorData.error string', function () {
      const errorData = {
        error: ApiErrorType.VALIDATION_FAILURE,
      };
      const result = getApiErrorMessage(errorData, t);
      assert.strictEqual(result, 'translated_errors.validation_failure');
    });

    it('should return translated message based on errorData.error.code', function () {
      const errorData = {
        error: {
          code: ApiErrorType.WRONG_CREDENTIALS,
        },
      };
      const result = getApiErrorMessage(errorData, t);
      assert.strictEqual(result, 'translated_errors.wrong_credentials');
    });

    it('should return unexpected error if no message and no errorCode found', function () {
      const errorData = {};
      const result = getApiErrorMessage(errorData, t);
      assert.strictEqual(result, 'translated_errors.unexpected_error');
    });

    it('should handle all ApiErrorType cases in switch', function () {
      const cases = [
        { code: ApiErrorType.VALIDATION_FAILURE, expected: 'translated_errors.validation_failure' },
        { code: ApiErrorType.WRONG_CREDENTIALS, expected: 'translated_errors.wrong_credentials' },
        { code: ApiErrorType.RECORD_NOT_FOUND, expected: 'translated_errors.record_not_found' },
        { code: ApiErrorType.RECORD_NOT_SAVED, expected: 'translated_errors.record_not_saved' },
        {
          code: ApiErrorType.RECORD_SAVE_FAILURE,
          expected: 'translated_errors.record_save_failure',
        },
        { code: ApiErrorType.APPLICATION_ERROR, expected: 'translated_errors.application_error' },
        { code: ApiErrorType.NOT_FOUND, expected: 'translated_errors.not_found' },
        { code: ApiErrorType.LOGIN_REQUIRED, expected: 'translated_errors.login_required' },
        { code: ApiErrorType.NETWORK_ERROR, expected: 'translated_errors.network_error' },
        { code: ApiErrorType.ACCOUNT_SUSPENDED, expected: 'translated_errors.account_suspended' },
        { code: ApiErrorType.ACCOUNT_BLOCKED, expected: 'translated_errors.account_blocked' },
        { code: ApiErrorType.ACCOUNT_INACTIVE, expected: 'translated_errors.account_inactive' },
        { code: ApiErrorType.RECORD_EXIST, expected: 'translated_errors.record_exist' },
        { code: ApiErrorType.UPDATE_FAILED, expected: 'translated_errors.update_failed' },
        { code: ApiErrorType.TRANSACTION_FAILED, expected: 'translated_errors.transaction_failed' },
        { code: ApiErrorType.USED_TOKEN, expected: 'translated_errors.used_token' },
        { code: ApiErrorType.BAD_VISITOR_TOKEN, expected: 'translated_errors.bad_visitor_token' },
        {
          code: ApiErrorType.FILE_FORMAT_NOT_SUPPORTED,
          expected: 'translated_errors.file_format_not_supported',
        },
        { code: ApiErrorType.NOT_AUTHORIZED, expected: 'translated_errors.not_authorized' },
        { code: ApiErrorType.BAD_INPUT, expected: 'translated_errors.bad_input' },
        { code: ApiErrorType.INPUT_NOT_UUID, expected: 'translated_errors.input_not_uuid' },
        { code: ApiErrorType.FILE_TOO_LARGE, expected: 'translated_errors.file_too_large' },
        { code: ApiErrorType.INVALID_TIME_VALUE, expected: 'translated_errors.invalid_time_value' },
        { code: ApiErrorType.UNKNOWN_ERROR, expected: 'translated_errors.unknown_error' },
        { code: ApiErrorType.PARSE_ERROR, expected: 'translated_errors.parse_error' },
        { code: ApiErrorType.UNEXPECTED_ERROR, expected: 'translated_errors.unexpected_error' },
        { code: 'UNKNOWN_CODE', expected: 'translated_errors.unexpected_error' },
      ];

      cases.forEach(({ code, expected }) => {
        const errorData = { error: { code } };
        const result = getApiErrorMessage(errorData, t);
        assert.strictEqual(result, expected, `Failed for code: ${code}`);
      });
    });

    it('should handle errorCode as case-insensitive', function () {
      const errorData = { error: 'validation_failure' };
      const result = getApiErrorMessage(errorData, t);
      assert.strictEqual(result, 'translated_errors.validation_failure');
    });

    it('should handle errorData.error as object without code', function () {
      const errorData = { error: { someOtherField: 'value' } };
      const result = getApiErrorMessage(errorData, t);
      assert.strictEqual(result, 'translated_errors.unexpected_error');
    });

    it('should handle errorData.error as non-string and non-object', function () {
      const errorData = { error: 123 };
      const result = getApiErrorMessage(errorData, t);
      assert.strictEqual(result, 'translated_errors.unexpected_error');
    });

    it('should handle error code as null or empty in getApiErrorMessage', function () {
      const errorData = { error: null };
      const result = getApiErrorMessage(errorData, t);
      assert.strictEqual(result, 'translated_errors.unexpected_error');
    });

    it('should handle error code as empty string', function () {
      const errorData = { error: '' };
      const result = getApiErrorMessage(errorData, t);
      assert.strictEqual(result, 'translated_errors.unexpected_error');
    });
  });
});
