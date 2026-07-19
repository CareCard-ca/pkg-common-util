'use strict';

const { describe, it, beforeEach, afterEach } = require('mocha');
const assert = require('assert');
const crypto = require('crypto');

describe('requestContext failure propagation', function () {
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

  it('should propagate when the required crypto.randomUUID API is unavailable', function () {
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

    assert.throws(() => requestContext(req, res, next), TypeError);
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(req.requestId, undefined);
  });

  it('should propagate crypto.randomUUID failures', function () {
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

    assert.throws(() => requestContext(req, res, next), /Mock error/);
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(req.requestId, undefined);
  });
});
