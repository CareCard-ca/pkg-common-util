'use strict';

const { describe, it, beforeEach, afterEach } = require('mocha');
const assert = require('assert');
const crypto = require('crypto');

describe('requestContext Fallback', function () {
  const originalRandomUUID = crypto.randomUUID;

  beforeEach(function () {
    // Clear cache to ensure we're testing the module with mocked crypto
    delete require.cache[require.resolve('../src/middleware/requestContext')];
  });

  afterEach(function () {
    // Restore original randomUUID
    Object.defineProperty(crypto, 'randomUUID', {
      value: originalRandomUUID,
      configurable: true,
      writable: true
    });
    // Restore cache just in case
    delete require.cache[require.resolve('../src/middleware/requestContext')];
  });

  it('should return zeroed UUID when crypto.randomUUID is not available', function () {
    // Mock randomUUID to be undefined
    Object.defineProperty(crypto, 'randomUUID', {
      value: undefined,
      configurable: true,
      writable: true
    });

    const requestContext = require('../src/middleware/requestContext');

    const req = { headers: {}, socket: {} };
    const res = {};
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    requestContext(req, res, next);

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.requestId, '00000000-0000-0000-0000-000000000000');
  });

  it('should return zeroed UUID when crypto.randomUUID throws', function () {
    // Mock randomUUID to throw
    Object.defineProperty(crypto, 'randomUUID', {
      value: () => {
        throw new Error('Mock error');
      },
      configurable: true,
      writable: true
    });

    const requestContext = require('../src/middleware/requestContext');

    const req = { headers: {}, socket: {} };
    const res = {};
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    requestContext(req, res, next);

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.requestId, '00000000-0000-0000-0000-000000000000');
  });
});
