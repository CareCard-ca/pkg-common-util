const assert = require('node:assert/strict');
const express = require('express');
const { afterEach, describe, it } = require('mocha');

const { createError, getActiveTraceMetadata, requestContext, sendResponse } = require('../index');
const { requestTestApplication } = require('./setup/requestTestApplication');

const originalEnvironment = {
  API_VERSION: process.env.API_VERSION,
  NODE_ENV: process.env.NODE_ENV,
  SERVICE_NAME: process.env.SERVICE_NAME,
};

function restoreEnvironmentVariable(name, value) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

function createPublicApplication(handler) {
  const application = express();
  application.set('trust proxy', true);
  application.use(requestContext);
  application.get('/', handler);
  return application;
}

describe('Standard response system', function () {
  afterEach(function () {
    for (const [name, value] of Object.entries(originalEnvironment)) {
      restoreEnvironmentVariable(name, value);
    }
  });

  describe('requestContext Middleware', function () {
    it('exposes service-owned request identity and continued W3C trace context over HTTP', async function () {
      const application = createPublicApplication((req, res) => {
        res.json({
          client: req.client,
          requestId: req.requestId,
          traceMetadata: getActiveTraceMetadata(),
        });
      });

      const response = await requestTestApplication(application, client =>
        client
          .get('/')
          .set('traceparent', '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01')
          .set('x-request-id', 'caller-owned-request-id')
          .set('x-trace-id', 'obsolete-trace-id')
          .set('x-app-id', 'test-app-id')
          .set('x-forwarded-for', '192.168.1.1'),
      );

      assert.equal(response.status, 200);
      assert.match(response.body.requestId, /^[0-9a-f-]{36}$/u);
      assert.notEqual(response.body.requestId, 'caller-owned-request-id');
      assert.deepEqual(response.body.client, {
        appId: 'test-app-id',
        ip: '192.168.1.1',
      });
      assert.equal(response.body.traceMetadata.traceId, '4bf92f3577b34da6a3ce929d0e0e4736');
      assert.equal(response.body.traceMetadata.parentSpanId, '00f067aa0ba902b7');
      assert.equal(response.body.traceMetadata.traceFlags, '01');
      assert.match(response.body.traceMetadata.spanId, /^[0-9a-f]{16}$/u);
      assert.equal(
        response.headers.traceparent,
        `00-${response.body.traceMetadata.traceId}-${response.body.traceMetadata.spanId}-01`,
      );
    });

    it('creates valid trace context when a caller does not provide one', async function () {
      const application = createPublicApplication((req, res) => {
        res.json({ requestId: req.requestId, traceMetadata: getActiveTraceMetadata() });
      });

      const response = await requestTestApplication(application, client => client.get('/'));

      assert.equal(response.status, 200);
      assert.match(response.body.requestId, /^[0-9a-f-]{36}$/u);
      assert.match(response.body.traceMetadata.traceId, /^[0-9a-f]{32}$/u);
      assert.match(response.body.traceMetadata.spanId, /^[0-9a-f]{16}$/u);
      assert.equal(response.body.traceMetadata.parentSpanId, undefined);
      assert.equal(
        response.headers.traceparent,
        `00-${response.body.traceMetadata.traceId}-${response.body.traceMetadata.spanId}-01`,
      );
    });

    it('uses the socket address when no framework or forwarded client address exists', function (done) {
      const req = {
        headers: {},
        socket: { remoteAddress: '10.0.0.1' },
      };

      requestContext(req, {}, () => {
        assert.equal(req.client.ip, '10.0.0.1');
        done();
      });
    });
  });

  describe('createError Helper', function () {
    it('creates the documented public error value', function () {
      const error = createError({
        code: 'VALIDATION_ERROR',
        details: 'Invalid input',
        fields: { email: 'Invalid format' },
      });

      assert.deepEqual(error, {
        code: 'VALIDATION_ERROR',
        details: 'Invalid input',
        message: undefined,
        fields: { email: 'Invalid format' },
      });
    });
  });

  describe('sendResponse Utility', function () {
    it('returns a standardized success response over HTTP', async function () {
      process.env.API_VERSION = '2.0.0';
      process.env.SERVICE_NAME = 'user-service';
      process.env.NODE_ENV = 'production';
      const application = createPublicApplication((req, res) => {
        sendResponse({
          req,
          res,
          statusCode: 201,
          message: 'Resource created',
          data: { id: 1 },
        });
      });

      const response = await requestTestApplication(application, client =>
        client
          .get('/')
          .set('traceparent', '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01')
          .set('x-app-id', 'app-789'),
      );

      assert.equal(response.status, 201);
      assert.equal(response.body.success, true);
      assert.equal(response.body.statusCode, 201);
      assert.equal(response.body.message, 'Resource created');
      assert.deepEqual(response.body.data, { id: 1 });
      assert.equal(response.body.meta.version, '2.0.0');
      assert.equal(response.body.meta.service, 'user-service');
      assert.equal(response.body.meta.environment, 'production');
      assert.match(response.body.meta.requestId, /^[0-9a-f-]{36}$/u);
      assert.equal(response.body.meta.traceId, '4bf92f3577b34da6a3ce929d0e0e4736');
      assert.equal(response.body.meta.client.appId, 'app-789');
      assert.match(response.body.meta.timestamp, /^\d{4}-\d{2}-\d{2}T/u);
    });

    it('returns caller-provided public metadata fields', async function () {
      const application = createPublicApplication((req, res) => {
        sendResponse({
          req,
          res,
          meta: {
            requestId: 'overridden-id',
            pagination: { page: 1, pageSize: 10, total: 100, totalPages: 10 },
          },
        });
      });

      const response = await requestTestApplication(application, client => client.get('/'));

      assert.equal(response.status, 200);
      assert.equal(response.body.meta.requestId, 'overridden-id');
      assert.deepEqual(response.body.meta.pagination, {
        page: 1,
        pageSize: 10,
        total: 100,
        totalPages: 10,
      });
    });

    it('returns a standardized error response over HTTP', async function () {
      const application = createPublicApplication((req, res) => {
        sendResponse({
          req,
          res,
          statusCode: 500,
          success: false,
          message: 'An error occurred',
          error: createError({
            code: 'INTERNAL_ERROR',
            details: 'Database connection failed',
          }),
        });
      });

      const response = await requestTestApplication(application, client => client.get('/'));

      assert.equal(response.status, 500);
      assert.equal(response.body.success, false);
      assert.equal(response.body.statusCode, 500);
      assert.deepEqual(response.body.error, {
        code: 'INTERNAL_ERROR',
        details: 'Database connection failed',
        message: 'An error occurred',
        fields: null,
      });
      assert.equal(response.body.data, null);
    });

    it('uses documented defaults when runtime metadata is absent', async function () {
      delete process.env.API_VERSION;
      delete process.env.SERVICE_NAME;
      delete process.env.NODE_ENV;
      const application = createPublicApplication((req, res) => sendResponse({ req, res }));

      const response = await requestTestApplication(application, client => client.get('/'));

      assert.equal(response.status, 200);
      assert.equal(response.body.meta.version, '1.0.0');
      assert.equal(response.body.meta.service, 'unknown-service');
      assert.equal(response.body.meta.environment, 'development');
      assert.match(response.body.meta.requestId, /^[0-9a-f-]{36}$/u);
      assert.match(response.body.meta.traceId, /^[0-9a-f]{32}$/u);
    });

    it('returns 204 No Content without a response body', async function () {
      const application = createPublicApplication((req, res) => {
        sendResponse({ req, res, statusCode: 204, data: { ignored: true } });
      });

      const response = await requestTestApplication(application, client => client.get('/'));

      assert.equal(response.status, 204);
      assert.equal(response.text, '');
      assert.equal(response.headers['content-type'], undefined);
    });
  });
});
