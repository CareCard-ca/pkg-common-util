'use strict';

/**
 * Internal function to convert string to camelCase.
 * @param {string} str
 * @returns {string}
 */
function toCamelCase(str) {
  return str
    .replace(/([-_][a-z0-9])/gi, $1 => {
      return $1.toUpperCase().replace('-', '').replace('_', '');
    })
    .replace(/^[A-Z]/, char => char.toLowerCase());
}

/**
 * Internal function to convert string to snake_case.
 * @param {string} str
 * @returns {string}
 */
function toSnakeCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .replace(/-/g, '_')
    .toLowerCase();
}

/**
 * Converts all keys of an object or array of objects to camelCase.
 * Handles nested objects and arrays.
 * @param {any} input
 * @returns {any}
 */
function keysToCamelCase(input) {
  if (input === null || typeof input !== 'object' || input instanceof Date) {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(keysToCamelCase);
  }

  const result = {};

  for (const [key, value] of Object.entries(input)) {
    result[toCamelCase(key)] = keysToCamelCase(value);
  }

  return result;
}

/**
 * Converts all keys of an object or array of objects to snake_case.
 * Handles nested objects and arrays.
 * @param {any} input
 * @returns {any}
 */
function keysToSnakeCase(input) {
  if (input === null || typeof input !== 'object' || input instanceof Date) {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(keysToSnakeCase);
  }

  const result = {};

  for (const [key, value] of Object.entries(input)) {
    result[toSnakeCase(key)] = keysToSnakeCase(value);
  }

  return result;
}

module.exports = {
  keysToCamelCase,
  keysToSnakeCase,
};
