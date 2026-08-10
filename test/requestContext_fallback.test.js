'use strict';

const assert = require('assert').strict;
const { spawnSync } = require('child_process');
const path = require('path');
const { describe, it } = require('mocha');

const packageRoot = path.resolve(__dirname, '..');

function observeRequestContextFailure(randomUuidSetup) {
  const consumerScript = `
    const crypto = require('node:crypto');
    ${randomUuidSetup}
    const { requestContext } = require('.');
    const request = { headers: {}, socket: {} };
    let nextCalled = false;
    try {
      requestContext(request, {}, () => { nextCalled = true; });
      process.stdout.write(JSON.stringify({ error: null, nextCalled, requestId: request.requestId ?? null }));
    } catch (error) {
      process.stdout.write(JSON.stringify({
        error: { message: error.message, name: error.name },
        nextCalled,
        requestId: request.requestId ?? null
      }));
    }
  `;
  const result = spawnSync(process.execPath, ['-e', consumerScript], {
    cwd: packageRoot,
    encoding: 'utf8'
  });

  assert.strictEqual(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

describe('requestContext failure propagation', function () {
  it('should propagate when the required crypto.randomUUID API is unavailable', function () {
    const observation = observeRequestContextFailure(
      "Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });"
    );

    assert.deepStrictEqual(observation.error?.name, 'TypeError');
    assert.match(observation.error?.message, /randomUUID/);
    assert.strictEqual(observation.nextCalled, false);
    assert.strictEqual(observation.requestId, null);
  });

  it('should propagate crypto.randomUUID failures', function () {
    const observation = observeRequestContextFailure(
      "Object.defineProperty(crypto, 'randomUUID', { value: () => { throw new Error('Mock error'); }, configurable: true });"
    );

    assert.deepStrictEqual(observation.error, { message: 'Mock error', name: 'Error' });
    assert.strictEqual(observation.nextCalled, false);
    assert.strictEqual(observation.requestId, null);
  });
});
