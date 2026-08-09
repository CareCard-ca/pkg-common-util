const { describe, it } = require('mocha');
const assert = require('assert');
const express = require('express');
const errHandler = require('../src/lib/appErrorHandlers');
const { requestTestApplication } = require('./setup/requestTestApplication');

function testApp(throwErrorFunction) {
  const app = express();

  app.use((req, res, next) => {
    throwErrorFunction();
  });

  app.use(errHandler.appErrorHandler);
  return app;
}

describe('AppErrorHandlers', function () {
  it('throwAccountSuspendedError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwAccountSuspendedError),
      (client) => client.get('/').expect(403)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'ACCOUNT_SUSPENDED');
  });

  it('throwAccountBlockedError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwAccountBlockedError),
      (client) => client.get('/').expect(403)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'ACCOUNT_BLOCKED');
  });

  it('throwAccountInactiveError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwAccountInactiveError),
      (client) => client.get('/').expect(403)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'ACCOUNT_INACTIVE');
  });

  it('throwValidationFailureError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwValidationFailureError),
      (client) => client.get('/').expect(401)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'VALIDATION_FAILURE');
  });

  it('throwRecordExistError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwRecordExistError),
      (client) => client.get('/').expect(409)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'RECORD_EXIST');
  });

  it('throwWrongCredentialsError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwWrongCredentialsError),
      (client) => client.get('/').expect(401)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'WRONG_CREDENTIALS');
  });

  it('throwLoginRequiredError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwLoginRequiredError),
      (client) => client.get('/').expect(401)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'LOGIN_REQUIRED');
  });

  it('throwRecordNotFoundError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwRecordNotFoundError),
      (client) => client.get('/').expect(404)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'RECORD_NOT_FOUND');
  });

  it('throwRecordNotSavedError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwRecordNotSavedError),
      (client) => client.get('/').expect(400)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'RECORD_NOT_SAVED');
  });

  it('throwUpdateFailedError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwUpdateFailedError),
      (client) => client.get('/').expect(400)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'UPDATE_FAILED');
  });

  it('throwTransactionFailedError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwTransactionFailedError),
      (client) => client.get('/').expect(400)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'TRANSACTION_FAILED');
  });

  it('throwUsedTokenError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwUsedTokenError),
      (client) => client.get('/').expect(401)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'USED_TOKEN');
  });

  it('throwBadVisitorTokenError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwBadVisitorTokenError),
      (client) => client.get('/').expect(401)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'BAD_VISITOR_TOKEN');
  });

  it('throwFileFormatNotSupportedError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwFileFormatNotSupportedError),
      (client) => client.get('/').expect(415)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'FILE_FORMAT_NOT_SUPPORTED');
  });

  it('throwNotAuthorizedError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwNotAuthorizedError),
      (client) => client.get('/').expect(401)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'NOT_AUTHORIZED');
  });

  it('throwBadInputError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwBadInputError),
      (client) => client.get('/').expect(400)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'BAD_INPUT');
  });

  it('throwInputNotUuidError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwInputNotUuidError),
      (client) => client.get('/').expect(400)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'INPUT_NOT_UUID');
  });

  it('throwFileTooLargeError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwFileTooLargeError),
      (client) => client.get('/').expect(413)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'FILE_TOO_LARGE');
  });

  it('throwInvalidTimeValueError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwInvalidTimeValueError),
      (client) => client.get('/').expect(403)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'INVALID_TIME_VALUE');
  });

  it('throwNotFoundError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwNotFoundError),
      (client) => client.get('/').expect(404)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'NOT_FOUND');
  });

  it('throwRecordSaveFailureError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwRecordSaveFailureError),
      (client) => client.get('/').expect(500)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'RECORD_SAVE_FAILURE');
  });

  it('throwApplicationError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwApplicationError),
      (client) => client.get('/').expect(500)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'APPLICATION_ERROR');
  });

  it('throwNetworkError', async function () {
    // Act
    const response = await requestTestApplication(testApp(errHandler.throwNetworkError), (client) =>
      client.get('/').expect(500)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'NETWORK_ERROR');
  });

  it('throwUnexpectedError', async function () {
    // Act
    const response = await requestTestApplication(
      testApp(errHandler.throwUnexpectedError),
      (client) => client.get('/').expect(500)
    );

    // Assert
    assert.deepStrictEqual(response?.body?.error?.code, 'UNEXPECTED_ERROR');
  });

  it('notFound404', async function () {
    const app = express();
    app.use(errHandler.notFound404);

    const response = await requestTestApplication(app, (client) =>
      client.get('/some-random-route').expect(404)
    );

    assert.deepStrictEqual(response?.body?.error?.code, 'NOT_FOUND');
  });

  it('appErrorHandler default case', async function () {
    const app = express();
    app.use((req, res, next) => {
      const err = new Error('Some_Unknown_Error');
      err.code = 'UNKNOWN_ERROR';
      next(err);
    });
    app.use(errHandler.appErrorHandler);

    const response = await requestTestApplication(app, (client) => client.get('/').expect(500));

    assert.strictEqual(response?.statusCode, 500);
    assert.deepStrictEqual(response?.body?.error?.code, 'UNKNOWN_ERROR');
  });

  it('appErrorHandler default case without code', async function () {
    const app = express();
    app.use((req, res, next) => {
      const err = new Error('Some_Other_Error');
      next(err);
    });
    app.use(errHandler.appErrorHandler);

    const response = await requestTestApplication(app, (client) => client.get('/').expect(500));

    assert.strictEqual(response?.statusCode, 500);
    assert.deepStrictEqual(response?.body?.error?.code, 'UNEXPECTED_ERROR');
  });

  it('appErrorHandler with missing error message', async function () {
    const app = express();
    app.use((req, res, next) => {
      const err = { code: 'SOME_CODE' }; // No message
      next(err);
    });
    app.use(errHandler.appErrorHandler);

    const response = await requestTestApplication(app, (client) => client.get('/').expect(500));

    assert.strictEqual(response?.body?.message, 'Internal server error');
  });

  it('appErrorHandler should use err.code for status mapping if message is unknown', async function () {
    const app = express();
    app.use((req, res, next) => {
      const err = new Error('Generic error message');
      err.code = 'RECORD_EXIST';
      next(err);
    });
    app.use(errHandler.appErrorHandler);

    const response = await requestTestApplication(app, (client) => client.get('/').expect(409));

    assert.strictEqual(response?.statusCode, 409);
    assert.deepStrictEqual(response?.body?.error?.code, 'RECORD_EXIST');
  });

  it('appErrorHandler should handle Postgres error 42501 as Forbidden (403)', async function () {
    const app = express();
    app.use((req, res, next) => {
      const err = new Error('violates row-level security policy for table "user_roles"');
      err.code = '42501';
      err.details = {
        sql: 'INSERT INTO institutions.user_roles ...',
        table: 'institutions.user_roles'
      };
      next(err);
    });
    app.use(errHandler.appErrorHandler);

    const response = await requestTestApplication(app, (client) => client.get('/').expect(403));

    assert.strictEqual(response?.statusCode, 403);
    assert.deepStrictEqual(response?.body?.error?.code, 'NOT_AUTHORIZED');
    assert.strictEqual(response?.body?.message, 'Not permitted to perform the action');
    assert.strictEqual(response?.body?.error?.message, 'Not permitted to perform the action');
    assert.strictEqual(response?.body?.details, null);
    assert.strictEqual(response?.body?.error?.details, null);
  });

  it('appErrorHandler should handle legacy Postgres 42501 message as Forbidden (403)', async function () {
    const app = express();
    app.use((req, res, next) => {
      const err = new Error('42501');
      err.details = {
        sql: 'SELECT * FROM audit.change_log'
      };
      next(err);
    });
    app.use(errHandler.appErrorHandler);

    const response = await requestTestApplication(app, (client) => client.get('/').expect(403));

    assert.strictEqual(response?.statusCode, 403);
    assert.deepStrictEqual(response?.body?.error?.code, 'NOT_AUTHORIZED');
    assert.strictEqual(response?.body?.message, 'Not permitted to perform the action');
    assert.strictEqual(response?.body?.error?.message, 'Not permitted to perform the action');
    assert.strictEqual(response?.body?.details, null);
    assert.strictEqual(response?.body?.error?.details, null);
  });

  describe('appErrorHandler legacy messages', function () {
    const legacyCases = [
      { message: 'Account_Suspended', expectedStatus: 403 },
      { message: 'Account_Blocked', expectedStatus: 403 },
      { message: 'Account_Inactive', expectedStatus: 403 },
      { message: 'Invalid time value', expectedStatus: 403 },
      { message: 'Validation_Failure', expectedStatus: 401 },
      { message: 'Used_Token', expectedStatus: 401 },
      { message: 'Wrong_Credentials', expectedStatus: 401 },
      { message: 'Bad_Visitor_Token', expectedStatus: 401 },
      { message: 'Login_Required', expectedStatus: 401 },
      { message: 'Not_Authorized', expectedStatus: 401 },
      { message: 'Record_NotSaved', expectedStatus: 400 },
      { message: 'Update_Failed', expectedStatus: 400 },
      { message: 'Transaction_Failed', expectedStatus: 400 },
      { message: 'Bad_Input', expectedStatus: 400 },
      { message: 'Input_Not_Uuid', expectedStatus: 400 },
      { message: 'Record_Exist', expectedStatus: 409 },
      { message: 'Record_NotFound', expectedStatus: 404 },
      { message: 'Not found', expectedStatus: 404 },
      { message: 'File_Format_Not_Supported', expectedStatus: 415 },
      { message: 'File too large', expectedStatus: 413 },
      { message: '42501', expectedStatus: 403 }
    ];

    legacyCases.forEach(({ message, expectedStatus }) => {
      it(`should handle legacy message "${message}"`, async function () {
        const app = express();
        app.use((req, res, next) => {
          next(new Error(message)); // No code, so it must use message
        });
        app.use(errHandler.appErrorHandler);

        await requestTestApplication(app, (client) => client.get('/').expect(expectedStatus));
      });
    });
  });

  describe('AppErrorHandlers Parameters', function () {
    it('should cover params default value and userMessage/details branches', function () {
      const throwFunctions = [
        errHandler.throwAccountSuspendedError,
        errHandler.throwAccountBlockedError,
        errHandler.throwAccountInactiveError,
        errHandler.throwValidationFailureError,
        errHandler.throwRecordExistError,
        errHandler.throwWrongCredentialsError,
        errHandler.throwLoginRequiredError,
        errHandler.throwRecordNotFoundError,
        errHandler.throwRecordNotSavedError,
        errHandler.throwUpdateFailedError,
        errHandler.throwTransactionFailedError,
        errHandler.throwUsedTokenError,
        errHandler.throwBadInputError,
        errHandler.throwInputNotUuidError,
        errHandler.throwFileTooLargeError,
        errHandler.throwInvalidTimeValueError,
        errHandler.throwNotFoundError,
        errHandler.throwRecordSaveFailureError,
        errHandler.throwApplicationError,
        errHandler.throwNetworkError,
        errHandler.throwUnexpectedError
      ];

      throwFunctions.forEach((fn) => {
        assert.throws(
          () => fn({ userMessage: 'test message', details: { foo: 'bar' } }),
          (error) => {
            assert.strictEqual(error.userMessage, 'test message');
            assert.deepStrictEqual(error.details, { foo: 'bar' });
            return true;
          }
        );
      });
    });

    it('should cover throwNotAuthorizedError with params', function () {
      assert.throws(
        () => errHandler.throwNotAuthorizedError({ userMessage: 'test', details: 'test' }),
        (error) => {
          assert.strictEqual(error.userMessage, 'test');
          return true;
        }
      );
    });

    it('should cover throwFileFormatNotSupportedError with params', function () {
      assert.throws(
        () => errHandler.throwFileFormatNotSupportedError({ userMessage: 'test', details: 'test' }),
        (error) => {
          assert.strictEqual(error.userMessage, 'test');
          return true;
        }
      );
    });
  });
});
