const assert = require('assert').strict;
const { describe, it } = require('mocha');
const srcIndex = require('../src/index');

describe('Source Index', function () {
  it('should export all utilities and nested objects', function () {
    assert.ok(srcIndex.util, 'util object should be exported');
    assert.ok(srcIndex.error, 'error object should be exported');
    assert.ok(srcIndex.resCode, 'resCode object should be exported');
    assert.ok(srcIndex.requestContext, 'requestContext should be exported');
    assert.ok(srcIndex.sendResponse, 'sendResponse should be exported');
    assert.ok(srcIndex.createError, 'createError should be exported');
    assert.ok(srcIndex.ApiErrorType, 'ApiErrorType should be exported');
    assert.ok(srcIndex.getApiErrorMessage, 'getApiErrorMessage should be exported');
  });

  it('should export all error throwers at top level (destructuring support)', function () {
    assert.strictEqual(typeof srcIndex.throwAccountSuspendedError, 'function');
    assert.strictEqual(typeof srcIndex.throwAccountBlockedError, 'function');
    assert.strictEqual(typeof srcIndex.throwAccountInactiveError, 'function');
    assert.strictEqual(typeof srcIndex.throwNotFoundError, 'function');
    assert.strictEqual(typeof srcIndex.throwRecordSaveFailureError, 'function');
    assert.strictEqual(typeof srcIndex.throwApplicationError, 'function');
    assert.strictEqual(typeof srcIndex.throwNetworkError, 'function');
    assert.strictEqual(typeof srcIndex.throwUnexpectedError, 'function');
    assert.strictEqual(typeof srcIndex.notFound404, 'function');
    assert.strictEqual(typeof srcIndex.appErrorHandler, 'function');
    assert.strictEqual(typeof srcIndex.throwValidationFailureError, 'function');
    assert.strictEqual(typeof srcIndex.throwRecordExistError, 'function');
    assert.strictEqual(typeof srcIndex.throwWrongCredentialsError, 'function');
    assert.strictEqual(typeof srcIndex.throwLoginRequiredError, 'function');
    assert.strictEqual(typeof srcIndex.throwRecordNotFoundError, 'function');
    assert.strictEqual(typeof srcIndex.throwRecordNotSavedError, 'function');
    assert.strictEqual(typeof srcIndex.throwUpdateFailedError, 'function');
    assert.strictEqual(typeof srcIndex.throwTransactionFailedError, 'function');
    assert.strictEqual(typeof srcIndex.throwUsedTokenError, 'function');
    assert.strictEqual(typeof srcIndex.throwBadVisitorTokenError, 'function');
    assert.strictEqual(typeof srcIndex.throwFileFormatNotSupportedError, 'function');
    assert.strictEqual(typeof srcIndex.throwNotAuthorizedError, 'function');
    assert.strictEqual(typeof srcIndex.throwBadInputError, 'function');
    assert.strictEqual(typeof srcIndex.throwInputNotUuidError, 'function');
    assert.strictEqual(typeof srcIndex.throwFileTooLargeError, 'function');
    assert.strictEqual(typeof srcIndex.throwInvalidTimeValueError, 'function');
  });

  it('should export utility functions at top level', function () {
    assert.strictEqual(typeof srcIndex.extractObjectWithProperties, 'function');
  });

  it('should export response status functions at top level', function () {
    assert.strictEqual(typeof srcIndex.setOk200, 'function');
    assert.strictEqual(typeof srcIndex.setCreated201, 'function');
    assert.strictEqual(typeof srcIndex.setBadRequest400ClientError, 'function');
  });
});
