const assert = require('assert').strict;
const { describe, it } = require('mocha');
const srcIndex = require('../src/index');

describe('Source Index', function () {
    it('should export all utilities', function () {
        assert.ok(srcIndex.util);
        assert.ok(srcIndex.error);
        assert.ok(srcIndex.resCode);
        assert.ok(srcIndex.requestContext);
        assert.ok(srcIndex.sendResponse);
        assert.ok(srcIndex.createError);
    });
});
