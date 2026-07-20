'use strict';

const { AsyncLocalStorage } = require('async_hooks');
const { randomBytes } = require('crypto');

const traceContextStore = new AsyncLocalStorage();
const traceparentPattern = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/;

function createRequestTraceMetadata(traceparent) {
  const incomingTraceMetadata = parseTraceparent(traceparent);

  return {
    traceId: incomingTraceMetadata?.traceId || createTraceId(),
    spanId: createSpanId(),
    parentSpanId: incomingTraceMetadata?.spanId,
    traceFlags: incomingTraceMetadata?.traceFlags || '01'
  };
}

function runWithTraceMetadata(traceMetadata, callback) {
  return traceContextStore.run(traceMetadata, callback);
}

function getActiveTraceMetadata() {
  return traceContextStore.getStore() || {};
}

function createTracePropagationHeaders() {
  const traceMetadata = getActiveTraceMetadata();
  if (!hasCompleteTraceMetadata(traceMetadata)) {
    return {};
  }

  return {
    traceparent: formatTraceparent(traceMetadata)
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
    traceFlags: match[3]
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
    typeof traceMetadata.traceFlags === 'string'
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
  runWithTraceMetadata
};
