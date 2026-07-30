'use strict';

const assert = require('assert').strict;
const { createHmac } = require('crypto');
const { EventEmitter } = require('events');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { afterEach, describe, it } = require('mocha');
const {
  createApplicationLogger,
  createHttpRequestLogger,
  installFatalProcessLogging
} = require('../logging');

const temporaryDirectories = [];

// Pattern: Test Data Builder - creates deterministic logger dependencies.
function createLoggerFixture(overrides = {}) {
  const writes = [];
  const logger = createApplicationLogger({
    environment: 'test',
    identityHmacKey: 'test-identity-key',
    now: () => new Date('2026-07-28T12:00:00.000Z'),
    service: 'ms-test',
    serviceVersion: '3.15.0',
    sink: (destination, line) => writes.push({ destination, line }),
    traceMetadataProvider: () => ({
      spanId: '0123456789abcdef',
      traceId: '0123456789abcdef0123456789abcdef'
    }),
    writeToConsole: false,
    ...overrides
  });
  return { logger, writes };
}

// Pattern: Test Fixture - removes only directories owned by this test module.
afterEach(function () {
  while (temporaryDirectories.length > 0) {
    fs.rmSync(temporaryDirectories.pop(), { force: true, recursive: true });
  }
});

describe('application logging', function () {
  it('writes one versioned NDJSON record with correlation and pseudonymous identity', function () {
    const { logger, writes } = createLoggerFixture();
    logger.info('Profile loaded', {
      actorUserId: 'user-123',
      operation: 'profile.read',
      requestId: 'request-123',
      resultCount: 1
    });

    assert.strictEqual(writes.length, 1);
    assert.strictEqual(writes[0].destination, 'stdout');
    assert.ok(writes[0].line.endsWith('\n'));
    assert.deepStrictEqual(JSON.parse(writes[0].line), {
      actorIdHash: createHmac('sha256', 'test-identity-key').update('user-123').digest('hex'),
      context: { resultCount: 1 },
      environment: 'test',
      level: 'info',
      message: 'Profile loaded',
      operation: 'profile.read',
      requestId: 'request-123',
      schemaVersion: 1,
      service: 'ms-test',
      serviceVersion: '3.15.0',
      spanId: '0123456789abcdef',
      timestamp: '2026-07-28T12:00:00.000Z',
      traceId: '0123456789abcdef0123456789abcdef'
    });
  });

  it('redacts secrets and personal data while preserving bounded error diagnostics', function () {
    const { logger, writes } = createLoggerFixture();
    const cause = Object.assign(new Error('email somebody@example.com'), {
      password: 'database-password'
    });
    const error = Object.assign(new Error('Query failed', { cause }), {
      authorization: 'Bearer secret-token',
      code: '42501'
    });
    const cyclicContext = { apiKey: 'secret', error };
    cyclicContext.self = cyclicContext;

    logger.error('Failed for somebody@example.com', cyclicContext);

    const record = JSON.parse(writes[0].line);
    assert.strictEqual(record.message, 'Failed for [REDACTED]');
    assert.strictEqual(record.context.apiKey, '[REDACTED]');
    assert.strictEqual(record.context.self, '[CIRCULAR]');
    assert.strictEqual(record.error.code, '42501');
    assert.strictEqual(record.error.authorization, '[REDACTED]');
    assert.strictEqual(record.error.cause.message, 'email [REDACTED]');
    assert.strictEqual(record.error.cause.password, '[REDACTED]');
    assert.ok(record.error.stack.includes('Query failed'));
    assert.ok(Buffer.byteLength(writes[0].line) <= 64 * 1024);
  });

  it('routes errors to stderr and filters levels below the configured minimum', function () {
    const { logger, writes } = createLoggerFixture({ minimumLevel: 'warn' });
    logger.debug('hidden debug');
    logger.info('hidden info');
    logger.warn('visible warning');
    logger.error('visible error');

    assert.deepStrictEqual(
      writes.map(({ destination, line }) => [destination, JSON.parse(line).level]),
      [
        ['stdout', 'warn'],
        ['stderr', 'error']
      ]
    );
  });

  it('rejects production logging without a strong identity HMAC key', function () {
    assert.throws(
      () => createApplicationLogger({ environment: 'production', service: 'ms-test' }),
      /LOG_IDENTITY_HMAC_KEY must contain at least 32 characters/
    );
  });

  it('rejects missing services and unsupported minimum levels', function () {
    assert.throws(() => createApplicationLogger(), /Application logger service is required/);
    assert.throws(
      () =>
        createApplicationLogger({
          environment: 'test',
          minimumLevel: 'verbose',
          service: 'ms-test'
        }),
      /LOG_LEVEL must be debug, info, warn, or error/
    );
  });

  it('uses default streams, timestamps, versions, tracing, and convenience adapters', function () {
    const stdoutLines = [];
    const stderrLines = [];
    const originalStdoutWrite = process.stdout.write;
    const originalStderrWrite = process.stderr.write;
    process.stdout.write = (line) => stdoutLines.push(String(line));
    process.stderr.write = (line) => stderrLines.push(String(line));

    try {
      const logger = createApplicationLogger({
        environment: 'test',
        service: 'ms-defaults'
      });
      logger.stream.write('stream message\n');
      logger.error('error message');
      assert.strictEqual(typeof logger.httpLogger(), 'function');
    } finally {
      process.stdout.write = originalStdoutWrite;
      process.stderr.write = originalStderrWrite;
    }

    const stdoutRecord = JSON.parse(stdoutLines[0]);
    assert.strictEqual(stdoutRecord.message, 'stream message');
    assert.strictEqual(stdoutRecord.serviceVersion, 'unknown');
    assert.match(stdoutRecord.timestamp, /^\d{4}-\d{2}-\d{2}T/);
    assert.strictEqual(stderrLines.length, 1);
  });

  it('replaces oversized metadata with a bounded truncation marker', function () {
    const { logger, writes } = createLoggerFixture();
    logger.info('large context', {
      payload: Array.from({ length: 10 }, (_, index) => `${index}-${'x'.repeat(20 * 1024)}`)
    });

    const record = JSON.parse(writes[0].line);
    assert.strictEqual(record.context.truncated, true);
    assert.ok(record.context.originalBytes > 64 * 1024);
    assert.ok(Buffer.byteLength(writes[0].line) <= 64 * 1024);
  });

  it('keeps a bounded error summary when an oversized error record is truncated', function () {
    const { logger, writes } = createLoggerFixture();
    logger.error('large error', {
      error: {
        payload: Array.from({ length: 10 }, (_, index) => `${index}-${'x'.repeat(20 * 1024)}`)
      },
      payload: Array.from({ length: 10 }, (_, index) => `${index}-${'y'.repeat(20 * 1024)}`)
    });

    const record = JSON.parse(writes[0].line);
    assert.deepStrictEqual(record.error, {
      message: 'Error diagnostics truncated',
      truncated: true
    });
  });

  it('rotates development NDJSON files within the configured bounded set', function () {
    const logDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'carecard-logging-'));
    temporaryDirectories.push(logDirectory);
    const logFilePath = path.join(logDirectory, 'application.ndjson');
    const { logger } = createLoggerFixture({
      environment: 'development',
      fileMaxBytes: 220,
      filePath: logFilePath,
      fileRetentionCount: 2,
      sink: undefined,
      traceMetadataProvider: () => ({})
    });

    for (let index = 0; index < 8; index += 1) {
      logger.info(`development record ${index}`, { value: 'bounded-value' });
    }

    assert.strictEqual(fs.existsSync(logFilePath), true);
    assert.strictEqual(fs.existsSync(`${logFilePath}.1`), true);
    assert.strictEqual(fs.existsSync(`${logFilePath}.2`), true);
    assert.strictEqual(fs.existsSync(`${logFilePath}.3`), false);
    assert.strictEqual(fs.statSync(logDirectory).mode & 0o777, 0o700);
    assert.strictEqual(fs.statSync(logFilePath).mode & 0o777, 0o600);
  });

  it('records one safe HTTP completion event without query strings or client headers', function () {
    const { logger, writes } = createLoggerFixture();
    const middleware = createHttpRequestLogger(logger, {
      nowMilliseconds: (() => {
        const values = [100, 137];
        return () => values.shift();
      })()
    });
    const response = new EventEmitter();
    response.statusCode = 204;
    const request = {
      baseUrl: '/users',
      headers: { authorization: 'Bearer token', 'user-agent': 'private-agent' },
      method: 'GET',
      originalUrl: '/users/123?token=secret',
      requestId: 'request-http',
      route: { path: '/:id' },
      socket: { remoteAddress: '127.0.0.1' }
    };
    let nextCalled = false;

    middleware(request, response, () => {
      nextCalled = true;
    });
    response.emit('finish');

    const record = JSON.parse(writes[0].line);
    assert.strictEqual(nextCalled, true);
    assert.deepStrictEqual(record.http, {
      durationMs: 37,
      method: 'GET',
      route: '/users/:id',
      statusCode: 204
    });
    assert.strictEqual(record.requestId, 'request-http');
    assert.strictEqual(writes[0].line.includes('secret'), false);
    assert.strictEqual(writes[0].line.includes('127.0.0.1'), false);
    assert.strictEqual(writes[0].line.includes('private-agent'), false);
  });

  it('records client and server HTTP failures at their matching severity', function () {
    const { logger, writes } = createLoggerFixture();
    const middleware = createHttpRequestLogger(logger, { nowMilliseconds: () => 100 });

    for (const statusCode of [404, 500]) {
      const response = new EventEmitter();
      response.statusCode = statusCode;
      middleware({ method: 'POST', path: '/fallback?secret=value' }, response, () => {});
      response.emit('finish');
    }

    assert.deepStrictEqual(
      writes.map(({ destination, line }) => [destination, JSON.parse(line).level]),
      [
        ['stdout', 'warn'],
        ['stderr', 'error']
      ]
    );
    assert.strictEqual(JSON.parse(writes[0].line).http.route, '/fallback');
  });

  it('normalizes message, metadata, HTTP, and request-route input variants', function () {
    const { logger, writes } = createLoggerFixture();
    logger.info(new Error('message error'), new Error('metadata error'));
    logger.info({ extra: true, message: 'object message' });
    logger.info(42, 99);
    logger.info('supplied HTTP', {
      actorUserId: null,
      http: { durationMs: 1, method: 'PATCH', route: '/items/:id', statusCode: 202 },
      operation: ''
    });
    logger.info('invalid HTTP', { http: ['not-an-object'] });

    assert.strictEqual(JSON.parse(writes[0].line).error.message, 'metadata error');
    assert.deepStrictEqual(JSON.parse(writes[1].line).context, { extra: true });
    assert.deepStrictEqual(JSON.parse(writes[2].line).context, { value: 99 });
    assert.strictEqual(JSON.parse(writes[2].line).message, '42');
    assert.strictEqual(JSON.parse(writes[3].line).operation, 'application.event');
    assert.deepStrictEqual(JSON.parse(writes[3].line).http, {
      durationMs: 1,
      method: 'PATCH',
      route: '/items/:id',
      statusCode: 202
    });
    assert.strictEqual(JSON.parse(writes[4].line).http, undefined);
  });

  it('bounds nested collections and normalizes unsupported metadata primitives', function () {
    const { logger } = createLoggerFixture();
    const deepValue = { level: 0 };
    const nestedCycle = {};
    nestedCycle.self = nestedCycle;
    let cursor = deepValue;
    for (let depth = 1; depth <= 8; depth += 1) {
      cursor.child = { level: depth };
      cursor = cursor.child;
    }
    const sanitized = logger.redactSensitiveMetadata({
      array: Array.from({ length: 60 }, (_, index) => index),
      bigint: 10n,
      deepValue,
      functionValue: function namedFunction() {},
      nestedCycle,
      nullValue: null,
      symbolValue: Symbol('symbol'),
      userId: 'user-456'
    });

    assert.strictEqual(sanitized.array.length, 50);
    assert.strictEqual(sanitized.bigint, '10');
    assert.strictEqual(sanitized.deepValue.child.child.child.child.child.child, '[MAX_DEPTH]');
    assert.match(sanitized.functionValue, /namedFunction/);
    assert.strictEqual(sanitized.nullValue, null);
    assert.strictEqual(sanitized.nestedCycle.self, '[CIRCULAR]');
    assert.strictEqual(sanitized.symbolValue, 'Symbol(symbol)');
    assert.strictEqual(
      sanitized.userId,
      createHmac('sha256', 'test-identity-key').update('user-456').digest('hex')
    );

    const loggerWithoutIdentityKey = createApplicationLogger({
      environment: 'test',
      service: 'ms-test',
      sink: () => {}
    });
    assert.strictEqual(
      loggerWithoutIdentityKey.redactSensitiveMetadata({ senderId: 'raw-user' }).senderId,
      '[REDACTED]'
    );
  });

  it('builds query-free request metadata from every supported path fallback', function () {
    const { logger } = createLoggerFixture();
    assert.strictEqual(logger.getRequestMetadata({ path: '/path?token=value' }).route, '/path');
    assert.strictEqual(
      logger.getRequestMetadata({ originalUrl: '/original?token=value' }).route,
      '/original'
    );
    assert.strictEqual(logger.getRequestMetadata({ url: '/url?token=value' }).route, '/url');
    assert.strictEqual(logger.getRequestMetadata({}).route, undefined);
    assert.strictEqual(
      logger.getRequestMetadata({ route: { path: '/:id' } }, { route: '/override' }).route,
      '/override'
    );
  });

  it('observes fatal process errors without installing an exception handler', function () {
    const { logger, writes } = createLoggerFixture();
    const processTarget = new EventEmitter();
    const uninstall = installFatalProcessLogging(logger, { processTarget });

    assert.strictEqual(processTarget.listenerCount('uncaughtException'), 0);
    assert.strictEqual(processTarget.listenerCount('uncaughtExceptionMonitor'), 1);
    processTarget.emit(
      'uncaughtExceptionMonitor',
      new Error('fatal failure'),
      'unhandledRejection'
    );
    uninstall();

    const record = JSON.parse(writes[0].line);
    assert.strictEqual(record.level, 'error');
    assert.strictEqual(record.operation, 'process.fatal');
    assert.strictEqual(record.context.origin, 'unhandledRejection');
    assert.strictEqual(processTarget.listenerCount('uncaughtExceptionMonitor'), 0);
  });

  it('installs and removes the default process monitor', function () {
    const { logger } = createLoggerFixture();
    const initialListeners = process.listenerCount('uncaughtExceptionMonitor');
    const uninstall = installFatalProcessLogging(logger);
    assert.strictEqual(process.listenerCount('uncaughtExceptionMonitor'), initialListeners + 1);
    uninstall();
    assert.strictEqual(process.listenerCount('uncaughtExceptionMonitor'), initialListeners);
  });
});
