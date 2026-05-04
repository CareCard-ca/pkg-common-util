const assert = require('assert').strict;
const { describe, it } = require('mocha');
const { util } = require('../index');

describe('UtilityFunctions', function () {
  describe('extractObjectWithProperties function', function () {
    it('should extract specified properties from an object', function (done) {
      const input = { one: '1', two: '2', three: '3', four: '4' };
      const expectedOutput = { one: '1', three: '3' };

      const output = util.extractObjectWithProperties(input, ['one', 'three']);

      assert.deepStrictEqual(output, expectedOutput);
      done();
    });

    it('should return an empty object if input object is null or undefined', function (done) {
      assert.deepStrictEqual(util.extractObjectWithProperties(null, ['one']), {});
      assert.deepStrictEqual(util.extractObjectWithProperties(undefined, ['one']), {});
      done();
    });

    it('should return an empty object if arrayOfProperties is not an array', function (done) {
      assert.deepStrictEqual(util.extractObjectWithProperties({ one: '1' }, null), {});
      assert.deepStrictEqual(util.extractObjectWithProperties({ one: '1' }, 'one'), {});
      assert.deepStrictEqual(util.extractObjectWithProperties({ one: '1' }, undefined), {});
      done();
    });

    it('should skip properties that do not exist in the source object', function (done) {
      const input = { one: '1' };
      const output = util.extractObjectWithProperties(input, ['one', 'two']);
      assert.deepStrictEqual(output, { one: '1' });
      done();
    });

    it('should extract falsy values (0, "", false)', function (done) {
      const input = { zero: 0, emptyStr: '', isFalse: false, isNull: null };
      const expectedOutput = { zero: 0, emptyStr: '', isFalse: false, isNull: null };

      const output = util.extractObjectWithProperties(input, [
        'zero',
        'emptyStr',
        'isFalse',
        'isNull'
      ]);

      assert.deepStrictEqual(output, expectedOutput);
      done();
    });
  });
});
