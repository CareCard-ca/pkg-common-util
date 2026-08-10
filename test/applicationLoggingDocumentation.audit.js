'use strict';

const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const { describe, it } = require('mocha');

const readme = fs.readFileSync(path.join(__dirname, '..', 'readme.md'), 'utf8');

describe('application logging documentation', function () {
  it('documents the subpath API, bounded storage, and sensitive-data contract', function () {
    assert.match(readme, /@carecard\/common-util\/logging/);
    assert.match(readme, /createApplicationLogger/);
    assert.match(readme, /LOG_IDENTITY_HMAC_KEY/);
    assert.match(readme, /10 MiB/);
    assert.match(readme, /NDJSON/);
    assert.match(readme, /must never contain raw user IDs/i);
  });
});
