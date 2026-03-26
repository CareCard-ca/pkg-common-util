const assert = require('assert').strict;
const { describe, it } = require('mocha');
const srcIndex = require('../src/index');

describe('Source Index', function () {
    it('should export standard response utilities', function () {
        assert.ok(srcIndex.requestContext);
        assert.ok(srcIndex.sendResponse);
        assert.ok(srcIndex.createError);
    });
});
