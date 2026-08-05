'use strict';

const assert = require('assert');
const { spawnSync } = require('child_process');
const { describe, it } = require('mocha');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '..');

function runRequestContextWithRandomUuidReplacement(replacementSource) {
  return spawnSync(
    process.execPath,
    [
      '-e',
      `
        const crypto = require('crypto');
        Object.defineProperty(crypto, 'randomUUID', {
          configurable: true,
          value: ${replacementSource},
          writable: true,
        });
        const { requestContext } = require('./index');
        const request = { headers: {}, socket: {} };
        let nextCalled = false;
        try {
          requestContext(request, {}, () => { nextCalled = true; });
          process.stderr.write(JSON.stringify({ nextCalled, requestId: request.requestId }));
          process.exit(2);
        } catch (error) {
          process.stdout.write(JSON.stringify({
            errorMessage: error.message,
            errorName: error.name,
            nextCalled,
            requestId: request.requestId,
          }));
        }
      `
    ],
    { cwd: repositoryRoot, encoding: 'utf8' }
  );
}

describe('requestContext failure propagation', function () {
  it('propagates when the required crypto.randomUUID API is unavailable', function () {
    const result = runRequestContextWithRandomUuidReplacement('undefined');

    assert.strictEqual(result.status, 0, result.stderr);
    assert.deepStrictEqual(JSON.parse(result.stdout), {
      errorMessage: 'randomUUID is not a function',
      errorName: 'TypeError',
      nextCalled: false
    });
  });

  it('propagates crypto.randomUUID failures', function () {
    const result = runRequestContextWithRandomUuidReplacement(
      `() => { throw new Error('Mock error'); }`
    );

    assert.strictEqual(result.status, 0, result.stderr);
    assert.deepStrictEqual(JSON.parse(result.stdout), {
      errorMessage: 'Mock error',
      errorName: 'Error',
      nextCalled: false
    });
  });
});
