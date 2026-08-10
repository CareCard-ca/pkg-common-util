'use strict';

const assert = require('assert').strict;
const { readFileSync } = require('fs');
const { describe, it } = require('mocha');

describe('W3C correlation documentation', function () {
  const readme = readFileSync('readme.md', 'utf8');

  it('documents service-owned request IDs and W3C trace propagation', function () {
    assert.match(readme, /service-owned `requestId`/i);
    assert.match(readme, /W3C `traceparent`/);
    assert.match(readme, /createTracePropagationHeaders/);
  });

  it('does not advertise obsolete custom correlation headers', function () {
    assert.doesNotMatch(readme, /x-trace-id/i);
    assert.doesNotMatch(readme, /x-request-id/i);
  });
});
