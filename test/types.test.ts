import assert from 'assert';
import {describe, it} from 'mocha';
import {util, error, resCode} from '../index';

describe('pkg-common-util TypeScript Type Definitions', () => {
    it('should verify util functions', () => {
        const source = { a: 1, b: 2, c: 3 };
        const result = util.extractObjectWithProperties(source, ['a', 'c']);
        assert.deepStrictEqual(result, { a: 1, c: 3 });
    });

    it('should verify error throwers (types only)', () => {
        // We just check if they are defined as functions
        assert.strictEqual(typeof error.throwValidationFailureError, 'function');
        assert.strictEqual(typeof error.appErrorHandler, 'function');
    });

    it('should verify resCode functions', () => {
        const dummyRes = {
            set: () => dummyRes,
            status: () => dummyRes
        };
        const result = resCode.setOk200(dummyRes, 'some-etag');
        assert.strictEqual(result, dummyRes);
    });
});
