'use strict';

const { createHmac } = require('crypto');
const {
  MAX_ARRAY_ITEMS,
  MAX_OBJECT_ENTRIES,
  MAX_SANITIZE_DEPTH,
  MAX_STRING_LENGTH
} = require('./constants');

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const identityKeyPattern =
  /^(actor(User)?Id|createdBy|recipientId|senderId|updatedBy|userId|user_id)$/i;
const sensitiveKeyPattern =
  /(api[-_]?key|authorization|client[-_]?secret|cookie|credential|email|ip(address)?|jwt|passphrase|password|private[-_]?key|secret|session|set-cookie|token|user[-_]?agent)/i;

// Pattern: Pure Function - replaces email-shaped personal data in free text.
function sanitizeLogText(value) {
  const boundedValue = value.slice(0, MAX_STRING_LENGTH);
  return boundedValue.includes('@')
    ? boundedValue.replace(emailPattern, '[REDACTED]')
    : boundedValue;
}

// Pattern: Pure Function - creates a stable one-way identity for log correlation.
function hashLogIdentity(value, identityHmacKey) {
  if (!identityHmacKey || typeof value !== 'string' || value.length === 0) {
    return '[REDACTED]';
  }
  return createHmac('sha256', identityHmacKey).update(value).digest('hex');
}

// Pattern: Data Mapper - preserves useful Error fields before recursive sanitization.
function getErrorDiagnosticEntries(error) {
  const ownEntries = Object.entries(error);
  return [
    ...ownEntries,
    ['name', error.name],
    ['code', error.code],
    ['message', error.message],
    ['stack', error.stack],
    ['cause', error.cause]
  ];
}

// Pattern: Recursive Sanitizer - bounds and redacts untrusted log metadata.
function sanitizeLogValue(value, options = {}, state = createSanitizeState()) {
  if (state.depth > MAX_SANITIZE_DEPTH) return '[MAX_DEPTH]';
  if (sensitiveKeyPattern.test(state.key)) return '[REDACTED]';
  if (identityKeyPattern.test(state.key))
    return hashLogIdentity(String(value), options.identityHmacKey);
  if (typeof value === 'string') return sanitizeLogText(value);
  if (value === null || typeof value !== 'object') return normalizePrimitive(value);
  if (state.ancestors.has(value)) return '[CIRCULAR]';
  return sanitizeObjectValue(value, options, state);
}

// Pattern: Pure Function - converts unsupported JSON primitives to safe text.
function normalizePrimitive(value) {
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'symbol' || typeof value === 'function') return String(value);
  return value;
}

// Pattern: Recursive Mapper - selects the bounded array, Error, or object strategy.
function sanitizeObjectValue(value, options, state) {
  state.ancestors.add(value);
  let result;
  if (value instanceof Error)
    result = sanitizeEntries(getErrorDiagnosticEntries(value), options, state);
  else if (Array.isArray(value)) result = sanitizeArray(value, options, state);
  else result = sanitizeEntries(Object.entries(value), options, state);
  state.ancestors.delete(value);
  return result;
}

// Pattern: Recursive Mapper - sanitizes a bounded number of array items.
function sanitizeArray(values, options, state) {
  return values
    .slice(0, MAX_ARRAY_ITEMS)
    .map((value, index) =>
      sanitizeLogValue(value, options, createChildState(state, String(index)))
    );
}

// Pattern: Recursive Mapper - sanitizes a bounded number of named object fields.
function sanitizeEntries(entries, options, state) {
  return Object.fromEntries(
    entries
      .slice(0, MAX_OBJECT_ENTRIES)
      .map(([key, value]) => [key, sanitizeLogValue(value, options, createChildState(state, key))])
      .filter(([, value]) => value !== undefined)
  );
}

// Pattern: Factory - creates isolated traversal state for one sanitization operation.
function createSanitizeState() {
  return { ancestors: new WeakSet(), depth: 0, key: '' };
}

// Pattern: Factory - advances traversal depth while sharing cycle detection.
function createChildState(state, key) {
  return { ancestors: state.ancestors, depth: state.depth + 1, key };
}

module.exports = {
  hashLogIdentity,
  sanitizeLogText,
  sanitizeLogValue
};
