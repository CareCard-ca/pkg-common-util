'use strict';

const { AsyncLocalStorage } = require('async_hooks');
const { randomBytes } = require('crypto');

const traceContextStore = new AsyncLocalStorage();
const traceparentPattern = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/;
let openTelemetryApi;
let openTelemetryApiWasLoaded = false;

// Pattern: Context Reconciliation - prefers the active SDK span over legacy request metadata.
function createRequestTraceMetadata(traceparent) {
  const incomingTraceMetadata = parseTraceparent(traceparent);
  const activeOpenTelemetryMetadata = getActiveOpenTelemetryMetadata();

  return {
    traceId:
      activeOpenTelemetryMetadata?.traceId || incomingTraceMetadata?.traceId || createTraceId(),
    spanId: activeOpenTelemetryMetadata?.spanId || createSpanId(),
    parentSpanId: incomingTraceMetadata?.spanId,
    traceFlags:
      activeOpenTelemetryMetadata?.traceFlags || incomingTraceMetadata?.traceFlags || '01',
  };
}

function runWithTraceMetadata(traceMetadata, callback) {
  return traceContextStore.run(traceMetadata, callback);
}

// Pattern: Context Facade - exposes one trace metadata contract to logging and propagation callers.
function getActiveTraceMetadata() {
  return getActiveOpenTelemetryMetadata() || traceContextStore.getStore() || {};
}

// Pattern: Adapter - converts the optional OpenTelemetry span context to CareCard metadata.
function getActiveOpenTelemetryMetadata() {
  const api = loadOpenTelemetryApi();
  const spanContext = api?.trace.getSpanContext(api.context.active());
  if (!spanContext || !api.trace.isSpanContextValid(spanContext)) {
    return undefined;
  }
  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
    traceFlags: formatTraceFlags(spanContext.traceFlags),
  };
}

// Pattern: Lazy Loader - resolves the optional peer only when trace metadata is requested.
function loadOpenTelemetryApi() {
  if (openTelemetryApiWasLoaded) {
    return openTelemetryApi;
  }
  openTelemetryApiWasLoaded = true;
  try {
    openTelemetryApi = require('@opentelemetry/api');
  } catch (error) {
    if (!isMissingOpenTelemetryApi(error)) {
      throw error;
    }
  }
  return openTelemetryApi;
}

// Pattern: Guard Clause - distinguishes an absent optional peer from unrelated load failures.
function isMissingOpenTelemetryApi(error) {
  return error?.code === 'MODULE_NOT_FOUND' && error.message.includes("'@opentelemetry/api'");
}

// Pattern: Pure Function - formats the SDK bit field as the W3C two-digit flag value.
function formatTraceFlags(traceFlags) {
  return (traceFlags & 0xff).toString(16).padStart(2, '0');
}

function createTracePropagationHeaders() {
  const traceMetadata = getActiveTraceMetadata();
  if (!hasCompleteTraceMetadata(traceMetadata)) {
    return {};
  }

  return {
    traceparent: formatTraceparent(traceMetadata),
  };
}

function parseTraceparent(value) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const match = value.toLowerCase().match(traceparentPattern);
  if (!match || isAllZero(match[1]) || isAllZero(match[2])) {
    return undefined;
  }

  return {
    traceId: match[1],
    spanId: match[2],
    traceFlags: match[3],
  };
}

function formatTraceparent({ traceId, spanId, traceFlags }) {
  return `00-${traceId}-${spanId}-${traceFlags}`;
}

function createTraceId() {
  return randomBytes(16).toString('hex');
}

function createSpanId() {
  return randomBytes(8).toString('hex');
}

function hasCompleteTraceMetadata(traceMetadata) {
  return Boolean(
    traceMetadata &&
    typeof traceMetadata.traceId === 'string' &&
    typeof traceMetadata.spanId === 'string' &&
    typeof traceMetadata.traceFlags === 'string',
  );
}

function isAllZero(value) {
  return /^0+$/.test(value);
}

module.exports = {
  createRequestTraceMetadata,
  createTracePropagationHeaders,
  formatTraceparent,
  getActiveTraceMetadata,
  runWithTraceMetadata,
};
