'use strict';

const path = require('path');
const { getActiveTraceMetadata } = require('../lib/traceContext');
const {
  DEFAULT_FILE_MAX_BYTES,
  DEFAULT_FILE_RETENTION_COUNT,
  LOG_LEVEL_PRIORITIES
} = require('./constants');
const { createLogRecord, serializeLogRecord } = require('./createLogRecord');
const createFileLogSink = require('./fileLogSink');
const { sanitizeLogValue } = require('./sanitizeLogValue');

// Pattern: Facade - exposes one stable structured logger over configured sinks.
function createApplicationLogger(options) {
  const configuration = createLoggerConfiguration(options);
  const writeLine = createLineWriter(configuration);
  const logger = createLoggerMethods(configuration, writeLine);
  logger.getRequestMetadata = (request, metadata) => createRequestMetadata(request, metadata);
  logger.redactSensitiveMetadata = (value) => sanitizeLogValue(value, configuration);
  logger.httpLogger = () => require('./createHttpRequestLogger')(logger);
  logger.stream = { write: (message) => logger.info(message) };
  return logger;
}

// Pattern: Configuration Object - validates and normalizes logger options once.
function createLoggerConfiguration(options = {}) {
  const environment = options.environment || process.env.NODE_ENV || 'development';
  const identityHmacKey = options.identityHmacKey || process.env.LOG_IDENTITY_HMAC_KEY;
  const minimumLevel =
    options.minimumLevel || process.env.LOG_LEVEL || defaultMinimumLevel(environment);
  validateLoggerConfiguration(options.service, environment, identityHmacKey, minimumLevel);
  return {
    environment,
    fileMaxBytes: options.fileMaxBytes || DEFAULT_FILE_MAX_BYTES,
    filePath: options.filePath || process.env.LOG_FILE_PATH || defaultLogFilePath(),
    fileRetentionCount: options.fileRetentionCount ?? DEFAULT_FILE_RETENTION_COUNT,
    identityHmacKey,
    minimumLevel,
    now: options.now || (() => new Date()),
    service: options.service,
    serviceVersion: options.serviceVersion || process.env.MS_VERSION || 'unknown',
    sink: options.sink,
    traceMetadataProvider: options.traceMetadataProvider || getActiveTraceMetadata,
    writeToConsole: options.writeToConsole !== false
  };
}

// Pattern: Guard Clause - rejects unsafe or incomplete logger configuration.
function validateLoggerConfiguration(service, environment, identityHmacKey, minimumLevel) {
  if (typeof service !== 'string' || service.length === 0) {
    throw new TypeError('Application logger service is required');
  }
  if (!Object.hasOwn(LOG_LEVEL_PRIORITIES, minimumLevel)) {
    throw new TypeError('LOG_LEVEL must be debug, info, warn, or error');
  }
  if (environment === 'production' && (!identityHmacKey || identityHmacKey.length < 32)) {
    throw new TypeError('LOG_IDENTITY_HMAC_KEY must contain at least 32 characters in production');
  }
}

// Pattern: Strategy - chooses the environment-specific output boundary.
function createLineWriter(configuration) {
  if (configuration.sink) return configuration.sink;
  const fileSink =
    configuration.environment === 'development'
      ? createFileLogSink(
          configuration.filePath,
          configuration.fileMaxBytes,
          configuration.fileRetentionCount
        )
      : undefined;
  return (destination, line) => writeDefaultLine(destination, line, fileSink, configuration);
}

// Pattern: Composite - sends development logs to console and bounded disk.
function writeDefaultLine(destination, line, fileSink, configuration) {
  if (configuration.writeToConsole) {
    const stream = destination === 'stderr' ? process.stderr : process.stdout;
    stream.write(line);
  }
  if (fileSink) fileSink(line);
}

// Pattern: Factory - creates level methods sharing one emission policy.
function createLoggerMethods(configuration, writeLine) {
  const logger = {};
  for (const level of Object.keys(LOG_LEVEL_PRIORITIES)) {
    logger[level] = (message, metadata) =>
      emitLogRecord(level, message, metadata, configuration, writeLine);
  }
  return logger;
}

// Pattern: Pipeline - filters, maps, serializes, and writes one log record.
function emitLogRecord(level, message, metadata, configuration, writeLine) {
  if (!shouldWriteLevel(level, configuration.minimumLevel)) return;
  const record = createLogRecord(level, message, metadata, configuration);
  const destination = level === 'error' ? 'stderr' : 'stdout';
  writeLine(destination, serializeLogRecord(record), record);
}

// Pattern: Pure Function - applies the configured minimum severity.
function shouldWriteLevel(level, minimumLevel) {
  return LOG_LEVEL_PRIORITIES[level] >= LOG_LEVEL_PRIORITIES[minimumLevel];
}

// Pattern: Data Mapper - extracts safe request correlation and route metadata.
function createRequestMetadata(request, metadata = {}) {
  return {
    actorUserId: request?.jwt?.payload?.sub,
    method: request?.method,
    requestId: request?.requestId,
    route: createRequestRoute(request),
    statusCode: request?.res?.statusCode,
    traceId: request?.traceId,
    ...metadata
  };
}

// Pattern: Pure Function - returns the templated route or a query-free path.
function createRequestRoute(request) {
  if (request?.route?.path) return `${request.baseUrl || ''}${request.route.path}`;
  const candidate = request?.path || request?.originalUrl || request?.url;
  return typeof candidate === 'string' ? candidate.split('?')[0] : undefined;
}

// Pattern: Configuration Policy - defaults test and development to debug detail.
function defaultMinimumLevel(environment) {
  return environment === 'production' ? 'info' : 'debug';
}

// Pattern: Configuration Policy - keeps development output inside the repository.
function defaultLogFilePath() {
  return path.join(process.cwd(), 'logs', 'application.ndjson');
}

module.exports = createApplicationLogger;
