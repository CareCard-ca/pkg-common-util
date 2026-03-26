const assert = require('assert').strict;
const { describe, it } = require('mocha');
const { requestContext, sendResponse, createError } = require('../index');

describe('Standard Response System', function () {
    describe('requestContext Middleware', function () {
        it('should attach requestId, traceId and client info to req', function (done) {
            const req = {
                headers: {
                    'x-trace-id': 'test-trace-id',
                    'x-app-id': 'test-app-id'
                },
                ip: '127.0.0.1'
            };
            const res = {};
            const next = () => {
                assert.ok(req.requestId);
                assert.strictEqual(req.traceId, 'test-trace-id');
                assert.strictEqual(req.client.appId, 'test-app-id');
                assert.strictEqual(req.client.ip, '127.0.0.1');
                done();
            };

            requestContext(req, res, next);
        });

        it('should generate traceId if not provided in headers', function (done) {
            const req = {
                headers: {},
                ip: '127.0.0.1'
            };
            const res = {};
            const next = () => {
                assert.ok(req.requestId);
                assert.ok(req.traceId);
                done();
            };

            requestContext(req, res, next);
        });

        it('should extract client IP from x-forwarded-for if req.ip is not available', function (done) {
            const req = {
                headers: {
                    'x-forwarded-for': '192.168.1.1'
                },
                socket: {
                    remoteAddress: '10.0.0.1'
                }
            };
            const res = {};
            const next = () => {
                assert.strictEqual(req.client.ip, '192.168.1.1');
                done();
            };

            requestContext(req, res, next);
        });

        it('should extract client IP from req.socket.remoteAddress if others are not available', function (done) {
            const req = {
                headers: {},
                socket: {
                    remoteAddress: '10.0.0.1'
                }
            };
            const res = {};
            const next = () => {
                assert.strictEqual(req.client.ip, '10.0.0.1');
                done();
            };

            requestContext(req, res, next);
        });
    });

    describe('createError Helper', function () {
        it('should create a standardized error object', function () {
            const error = createError({
                code: 'VALIDATION_ERROR',
                details: 'Invalid input',
                fields: { email: 'Invalid format' }
            });

            assert.deepStrictEqual(error, {
                code: 'VALIDATION_ERROR',
                details: 'Invalid input',
                fields: { email: 'Invalid format' }
            });
        });
    });

    describe('sendResponse Utility', function () {
        it('should send a standardized response', function (done) {
            process.env.API_VERSION = '2.0.0';
            process.env.SERVICE_NAME = 'user-service';
            process.env.NODE_ENV = 'production';

            const req = {
                requestId: 'req-123',
                traceId: 'trace-456',
                client: { appId: 'app-789', ip: '1.1.1.1' }
            };
            const res = {
                status(code) {
                    assert.strictEqual(code, 201);
                    return this;
                },
                json(body) {
                    assert.strictEqual(body.success, true);
                    assert.strictEqual(body.statusCode, 201);
                    assert.strictEqual(body.message, 'Resource created');
                    assert.deepStrictEqual(body.data, { id: 1 });
                    assert.strictEqual(body.meta.version, '2.0.0');
                    assert.strictEqual(body.meta.service, 'user-service');
                    assert.strictEqual(body.meta.environment, 'production');
                    assert.strictEqual(body.meta.requestId, 'req-123');
                    assert.strictEqual(body.meta.traceId, 'trace-456');
                    assert.strictEqual(body.meta.client.appId, 'app-789');
                    assert.ok(body.meta.timestamp);
                    done();
                }
            };

            sendResponse({
                req,
                res,
                statusCode: 201,
                message: 'Resource created',
                data: { id: 1 }
            });
        });

        it('should allow overriding meta fields', function (done) {
            const req = { requestId: 'req-1', traceId: 'trace-1' };
            const res = {
                status(code) { return this; },
                json(body) {
                    assert.strictEqual(body.meta.requestId, 'overridden-id');
                    assert.deepStrictEqual(body.meta.pagination, { page: 1, limit: 10, total: 100 });
                    done();
                }
            };

            sendResponse({
                req,
                res,
                meta: {
                    requestId: 'overridden-id',
                    pagination: { page: 1, limit: 10, total: 100 }
                }
            });
        });

        it('should send an error response with standardized format', function (done) {
            const req = { requestId: 'req-err', traceId: 'trace-err' };
            const error = createError({
                code: 'INTERNAL_ERROR',
                details: 'Database connection failed'
            });

            const res = {
                status(code) {
                    assert.strictEqual(code, 500);
                    return this;
                },
                json(body) {
                    assert.strictEqual(body.success, false);
                    assert.strictEqual(body.statusCode, 500);
                    assert.deepStrictEqual(body.error, error);
                    assert.strictEqual(body.data, null);
                    done();
                }
            };

            sendResponse({
                req,
                res,
                statusCode: 500,
                success: false,
                message: 'An error occurred',
                error
            });
        });

        it('should use default values for meta if not provided in env or req', function (done) {
            // Save current env
            const oldApiVersion = process.env.API_VERSION;
            const oldServiceName = process.env.SERVICE_NAME;
            const oldNodeEnv = process.env.NODE_ENV;

            delete process.env.API_VERSION;
            delete process.env.SERVICE_NAME;
            delete process.env.NODE_ENV;

            const req = {}; // Missing requestId, traceId
            const res = {
                status(code) { return this; },
                json(body) {
                    assert.strictEqual(body.meta.version, '1.0.0');
                    assert.strictEqual(body.meta.service, 'unknown-service');
                    assert.strictEqual(body.meta.environment, 'development');
                    assert.strictEqual(body.meta.requestId, '');
                    assert.strictEqual(body.meta.traceId, '');
                    
                    // Restore env
                    process.env.API_VERSION = oldApiVersion;
                    process.env.SERVICE_NAME = oldServiceName;
                    process.env.NODE_ENV = oldNodeEnv;
                    done();
                }
            };

            sendResponse({ req, res });
        });
    });
});
