'use strict';

const { MAX_LOG_BYTES, SCHEMA_VERSION } = require('./constants');
const { hashLogIdentity, sanitizeLogText, sanitizeLogValue } = require('./sanitizeLogValue');

const reservedContextKeys = new Set([
  'actorUserId',
  'durationMs',
  'error',
  'http',
  'httpVersion',
  'method',
  'operation',
  'parentSpanId',
  'path',
  'requestId',
  'route',
  'spanId',
  'statusCode',
  'traceFlags',
  'traceId',
]);

// Pattern: Data Mapper - converts one logger call into the stable application log schema.
function createLogRecord(level, message, metadata, configuration) {
  const metadataRecord = normalizeMetadata(metadata);
  const traceMetadata = configuration.traceMetadataProvider();
  return compactUndefinedProperties({
    actorIdHash: createActorIdHash(metadataRecord, configuration.identityHmacKey),
    context: createLogContext(message, metadataRecord, configuration),
    environment: configuration.environment,
    error: createLogError(metadataRecord, configuration),
    http: createHttpMetadata(metadataRecord, configuration),
    level,
    message: createLogMessage(message),
    operation: sanitizeOptionalText(metadataRecord.operation) || 'application.event',
    requestId: sanitizeOptionalText(metadataRecord.requestId),
    schemaVersion: SCHEMA_VERSION,
    service: configuration.service,
    serviceVersion: configuration.serviceVersion,
    spanId: sanitizeOptionalText(metadataRecord.spanId || traceMetadata.spanId),
    timestamp: configuration.now().toISOString(),
    traceId: sanitizeOptionalText(metadataRecord.traceId || traceMetadata.traceId),
  });
}

// Pattern: Data Mapper - converts supported metadata inputs to a record.
function normalizeMetadata(metadata) {
  if (metadata instanceof Error) {
    return { error: metadata };
  }
  if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
    return metadata;
  }
  if (metadata === undefined) {
    return {};
  }
  return { value: metadata };
}

// Pattern: Pure Function - normalizes logger message inputs without leaking objects.
function createLogMessage(message) {
  if (typeof message === 'string') {
    return sanitizeLogText(message.replace(/\n$/, ''));
  }
  if (message instanceof Error) {
    return sanitizeLogText(message.message);
  }
  if (message && typeof message.message === 'string') {
    return sanitizeLogText(message.message);
  }
  return sanitizeLogText(String(message));
}

// Pattern: Data Mapper - extracts and sanitizes non-schema metadata as context.
function createLogContext(message, metadata, configuration) {
  const contextEntries = Object.entries(metadata)
    .filter(([key]) => !reservedContextKeys.has(key))
    .map(([key, value]) => [key, value === metadata ? '[CIRCULAR]' : value]);
  if (message && typeof message === 'object' && !(message instanceof Error)) {
    contextEntries.push(...Object.entries(message).filter(([key]) => key !== 'message'));
  }
  if (contextEntries.length === 0) {
    return undefined;
  }
  return sanitizeLogValue(Object.fromEntries(contextEntries), configuration);
}

// Pattern: Pure Function - returns a pseudonym only when an actor identity exists.
function createActorIdHash(metadata, identityHmacKey) {
  if (metadata.actorUserId === undefined || metadata.actorUserId === null) {
    return undefined;
  }
  return hashLogIdentity(String(metadata.actorUserId), identityHmacKey);
}

// Pattern: Data Mapper - extracts sanitized Error diagnostics from metadata.
function createLogError(metadata, configuration) {
  if (metadata.error === undefined) {
    return undefined;
  }
  return sanitizeLogValue(metadata.error, configuration);
}

// Pattern: Data Mapper - creates a safe HTTP object from structured request fields.
function createHttpMetadata(metadata, configuration) {
  const suppliedHttp = normalizeHttpInput(metadata.http);
  const http = compactUndefinedProperties({
    durationMs: suppliedHttp.durationMs ?? metadata.durationMs,
    method: suppliedHttp.method ?? metadata.method,
    route: suppliedHttp.route ?? metadata.route ?? metadata.path,
    statusCode: suppliedHttp.statusCode ?? metadata.statusCode,
  });
  if (Object.keys(http).length === 0) {
    return undefined;
  }
  return sanitizeLogValue(http, configuration);
}

// Pattern: Pure Function - accepts only object-shaped HTTP metadata.
function normalizeHttpInput(http) {
  if (http && typeof http === 'object' && !Array.isArray(http)) {
    return http;
  }
  return {};
}

// Pattern: Pure Function - sanitizes optional schema text fields.
function sanitizeOptionalText(value) {
  return typeof value === 'string' && value.length > 0 ? sanitizeLogText(value) : undefined;
}

// Pattern: Data Mapper - removes undefined values from a shallow schema object.
function compactUndefinedProperties(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, childValue]) => childValue !== undefined),
  );
}

// Pattern: Serialization Policy - guarantees one valid bounded NDJSON line.
function serializeLogRecord(record) {
  const serialized = JSON.stringify(record);
  if (Buffer.byteLength(serialized) < MAX_LOG_BYTES) {
    return `${serialized}\n`;
  }
  const boundedRecord = createBoundedRecord(record, Buffer.byteLength(serialized));
  return `${JSON.stringify(boundedRecord)}\n`;
}

// Pattern: Data Mapper - preserves searchable fields when oversized context is discarded.
function createBoundedRecord(record, originalBytes) {
  return {
    ...record,
    context: { originalBytes, truncated: true },
    error: record.error
      ? {
          message: sanitizeLogText(record.error.message || 'Error diagnostics truncated'),
          truncated: true,
        }
      : undefined,
  };
}

module.exports = {
  createLogRecord,
  serializeLogRecord,
};
