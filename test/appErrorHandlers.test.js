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
        if (err) return;

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
        if (err) return;

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
        if (err) return;

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
        if (err) return;

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
        if (err) return;

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
        if (err) return;

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
        if (err) return;

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
        if (err) return;

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
        if (err) return;

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
        if (err) return;

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
        if (err) return;

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
        if (err) return;

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
        if (err) return;

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
        if (err) return;

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
        if (err) return;

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
        if (err) return;

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
        if (err) return;

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
        if (err) return;

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
        if (err) return;

        // Assert
        assert.deepStrictEqual(response?.body?.error?.code, 'INVALID_TIME_VALUE');
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
        if (err) return;
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
        if (err) return;
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
        if (err) return;
        assert.strictEqual(response?.statusCode, 500);
        assert.deepStrictEqual(response?.body?.error?.code, null);
        done();
      });
  });
});
