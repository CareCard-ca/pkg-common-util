const { describe, it } = require('mocha');
const request = require('supertest');
const assert = require('assert');
const express = require('express');
const errHandler = require('../src/lib/appErrorHandlers');

function testApp(throwErrorFunction) {
  const app = express();

  app.use((req, res, next) => {
    throwErrorFunction();
  });

  app.use(errHandler.appErrorHandler);
  return app;
}

describe('AppErrorHandlers', function () {
  it('throwAccountSuspendedError', function (done) {
    // Act
    request(testApp(errHandler.throwAccountSuspendedError))
      .get('/')
      .expect(403)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'ACCOUNT_SUSPENDED');
        done();
      });
  });

  it('throwAccountBlockedError', function (done) {
    // Act
    request(testApp(errHandler.throwAccountBlockedError))
      .get('/')
      .expect(403)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'ACCOUNT_BLOCKED');
        done();
      });
  });

  it('throwAccountInactiveError', function (done) {
    // Act
    request(testApp(errHandler.throwAccountInactiveError))
      .get('/')
      .expect(403)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'ACCOUNT_INACTIVE');
        done();
      });
  });

  it('throwValidationFailureError', function (done) {
    // Act
    request(testApp(errHandler.throwValidationFailureError))
      .get('/')
      .expect(401)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'VALIDATION_FAILURE');
        done();
      });
  });

  it('throwRecordExistError', function (done) {
    // Act
    request(testApp(errHandler.throwRecordExistError))
      .get('/')
      .expect(409)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'RECORD_EXIST');
        done();
      });
  });

  it('throwWrongCredentialsError', function (done) {
    // Act
    request(testApp(errHandler.throwWrongCredentialsError))
      .get('/')
      .expect(401)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'WRONG_CREDENTIALS');
        done();
      });
  });

  it('throwLoginRequiredError', function (done) {
    // Act
    request(testApp(errHandler.throwLoginRequiredError))
      .get('/')
      .expect(401)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'LOGIN_REQUIRED');
        done();
      });
  });

  it('throwRecordNotFoundError', function (done) {
    // Act
    request(testApp(errHandler.throwRecordNotFoundError))
      .get('/')
      .expect(404)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'RECORD_NOT_FOUND');
        done();
      });
  });

  it('throwRecordNotSavedError', function (done) {
    // Act
    request(testApp(errHandler.throwRecordNotSavedError))
      .get('/')
      .expect(400)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'RECORD_NOT_SAVED');
        done();
      });
  });

  it('throwUpdateFailedError', function (done) {
    // Act
    request(testApp(errHandler.throwUpdateFailedError))
      .get('/')
      .expect(400)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'UPDATE_FAILED');
        done();
      });
  });

  it('throwTransactionFailedError', function (done) {
    // Act
    request(testApp(errHandler.throwTransactionFailedError))
      .get('/')
      .expect(400)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'TRANSACTION_FAILED');
        done();
      });
  });

  it('throwUsedTokenError', function (done) {
    // Act
    request(testApp(errHandler.throwUsedTokenError))
      .get('/')
      .expect(401)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'USED_TOKEN');
        done();
      });
  });

  it('throwBadVisitorTokenError', function (done) {
    // Act
    request(testApp(errHandler.throwBadVisitorTokenError))
      .get('/')
      .expect(401)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'BAD_VISITOR_TOKEN');
        done();
      });
  });

  it('throwFileFormatNotSupportedError', function (done) {
    // Act
    request(testApp(errHandler.throwFileFormatNotSupportedError))
      .get('/')
      .expect(415)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'FILE_FORMAT_NOT_SUPPORTED');
        done();
      });
  });

  it('throwNotAuthorizedError', function (done) {
    // Act
    request(testApp(errHandler.throwNotAuthorizedError))
      .get('/')
      .expect(401)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'NOT_AUTHORIZED');
        done();
      });
  });

  it('throwBadInputError', function (done) {
    // Act
    request(testApp(errHandler.throwBadInputError))
      .get('/')
      .expect(400)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'BAD_INPUT');
        done();
      });
  });

  it('throwInputNotUuidError', function (done) {
    // Act
    request(testApp(errHandler.throwInputNotUuidError))
      .get('/')
      .expect(400)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'INPUT_NOT_UUID');
        done();
      });
  });

  it('throwFileTooLargeError', function (done) {
    // Act
    request(testApp(errHandler.throwFileTooLargeError))
      .get('/')
      .expect(413)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'FILE_TOO_LARGE');
        done();
      });
  });

  it('throwInvalidTimeValueError', function (done) {
    // Act
    request(testApp(errHandler.throwInvalidTimeValueError))
      .get('/')
      .expect(403)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'INVALID_TIME_VALUE');
        done();
      });
  });

  it('throwNotFoundError', function (done) {
    // Act
    request(testApp(errHandler.throwNotFoundError))
      .get('/')
      .expect(404)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'NOT_FOUND');
        done();
      });
  });

  it('throwRecordSaveFailureError', function (done) {
    // Act
    request(testApp(errHandler.throwRecordSaveFailureError))
      .get('/')
      .expect(500)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'RECORD_SAVE_FAILURE');
        done();
      });
  });

  it('throwApplicationError', function (done) {
    // Act
    request(testApp(errHandler.throwApplicationError))
      .get('/')
      .expect(500)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'APPLICATION_ERROR');
        done();
      });
  });

  it('throwNetworkError', function (done) {
    // Act
    request(testApp(errHandler.throwNetworkError))
      .get('/')
      .expect(500)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'NETWORK_ERROR');
        done();
      });
  });

  it('throwUnexpectedError', function (done) {
    // Act
    request(testApp(errHandler.throwUnexpectedError))
      .get('/')
      .expect(500)
      .end((err, response) => {
        if (err) return done(err);

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'UNEXPECTED_ERROR');
        done();
      });
  });

  it('notFound404', function (done) {
    const app = express();
    app.use(errHandler.notFound404);

    request(app)
      .get('/some-random-route')
      .expect(404)
      .end((err, response) => {
        if (err) return done(err);
        assert.deepStrictEqual(response?.body?.error?.code, 'NOT_FOUND');
        done();
      });
  });

  it('appErrorHandler default case', function (done) {
    const app = express();
    app.use((req, res, next) => {
      const err = new Error('Some_Unknown_Error');
      err.code = 'UNKNOWN_ERROR';
      next(err);
    });
    app.use(errHandler.appErrorHandler);

    request(app)
      .get('/')
      .expect(500)
      .end((err, response) => {
        if (err) return done(err);
        assert.strictEqual(response?.statusCode, 500);
        assert.deepStrictEqual(response?.body?.error?.code, 'UNKNOWN_ERROR');
        done();
      });
  });

  it('appErrorHandler default case without code', function (done) {
    const app = express();
    app.use((req, res, next) => {
      const err = new Error('Some_Other_Error');
      next(err);
    });
    app.use(errHandler.appErrorHandler);

    request(app)
      .get('/')
      .expect(500)
      .end((err, response) => {
        if (err) return done(err);
        assert.strictEqual(response?.statusCode, 500);
        assert.deepStrictEqual(response?.body?.error?.code, 'UNEXPECTED_ERROR');
        done();
      });
  });

  it('appErrorHandler with missing error message', function (done) {
    const app = express();
    app.use((req, res, next) => {
      const err = { code: 'SOME_CODE' }; // No message
      next(err);
    });
    app.use(errHandler.appErrorHandler);

    request(app)
      .get('/')
      .expect(500)
      .end((err, response) => {
        if (err) return done(err);
        assert.strictEqual(response?.body?.message, 'Internal server error');
        done();
      });
  });

  it('appErrorHandler should use err.code for status mapping if message is unknown', function (done) {
    const app = express();
    app.use((req, res, next) => {
      const err = new Error('Generic error message');
      err.code = 'RECORD_EXIST';
      next(err);
    });
    app.use(errHandler.appErrorHandler);

    request(app)
      .get('/')
      .expect(409)
      .end((err, response) => {
        if (err) return done(err);
        assert.strictEqual(response?.statusCode, 409);
        assert.deepStrictEqual(response?.body?.error?.code, 'RECORD_EXIST');
        done();
      });
  });

  it('appErrorHandler should handle Postgres error 42501 as Forbidden (403)', function (done) {
    const app = express();
    app.use((req, res, next) => {
      const err = new Error('violates row-level security policy for table "user_roles"');
      err.code = '42501';
      err.details = {
        sql: 'INSERT INTO carecard.user_roles ...',
        table: 'carecard.user_roles'
      };
      next(err);
    });
    app.use(errHandler.appErrorHandler);

    request(app)
      .get('/')
      .expect(403)
      .end((err, response) => {
        if (err) return done(err);
        assert.strictEqual(response?.statusCode, 403);
        assert.deepStrictEqual(response?.body?.error?.code, 'NOT_AUTHORIZED');
        assert.strictEqual(response?.body?.message, 'Not permitted to perform the action');
        assert.strictEqual(response?.body?.error?.message, 'Not permitted to perform the action');
        assert.strictEqual(response?.body?.details, null);
        assert.strictEqual(response?.body?.error?.details, null);
        done();
      });
  });

  it('appErrorHandler should handle legacy Postgres 42501 message as Forbidden (403)', function (done) {
    const app = express();
    app.use((req, res, next) => {
      const err = new Error('42501');
      err.details = {
        sql: 'SELECT * FROM carecard.audit_log'
      };
      next(err);
    });
    app.use(errHandler.appErrorHandler);

    request(app)
      .get('/')
      .expect(403)
      .end((err, response) => {
        if (err) return done(err);
        assert.strictEqual(response?.statusCode, 403);
        assert.deepStrictEqual(response?.body?.error?.code, 'NOT_AUTHORIZED');
        assert.strictEqual(response?.body?.message, 'Not permitted to perform the action');
        assert.strictEqual(response?.body?.error?.message, 'Not permitted to perform the action');
        assert.strictEqual(response?.body?.details, null);
        assert.strictEqual(response?.body?.error?.details, null);
        done();
      });
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
      it(`should handle legacy message "${message}"`, function (done) {
        const app = express();
        app.use((req, res, next) => {
          next(new Error(message)); // No code, so it must use message
        });
        app.use(errHandler.appErrorHandler);

        request(app).get('/').expect(expectedStatus).end(done);
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
        try {
          fn({ userMessage: 'test message', details: { foo: 'bar' } });
        } catch (error) {
          assert.strictEqual(error.userMessage, 'test message');
          assert.deepStrictEqual(error.details, { foo: 'bar' });
        }
      });
    });

    it('should cover throwNotAuthorizedError with params', function () {
      try {
        errHandler.throwNotAuthorizedError({ userMessage: 'test', details: 'test' });
      } catch (error) {
        assert.strictEqual(error.userMessage, 'test');
      }
    });

    it('should cover throwFileFormatNotSupportedError with params', function () {
      try {
        errHandler.throwFileFormatNotSupportedError({ userMessage: 'test', details: 'test' });
      } catch (error) {
        assert.strictEqual(error.userMessage, 'test');
      }
    });
  });
});
