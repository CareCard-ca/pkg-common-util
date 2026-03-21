import assert from 'assert';
import {describe, it} from 'mocha';
import {util, error, resCode} from '../index';

describe('pkg-common-util TypeScript Type Definitions', () => {
    it('should verify util functions', () => {
        const source = { a: 1, b: 2, c: 3 };
        const result = util.extractObjectWithProperties(source, ['a', 'c']);
        assert.deepStrictEqual(result, { a: 1, c: 3 });
    });

    describe('error functions', () => {
        const mockRes = {
            status: function(code: number) { this.statusCode = code; return this; },
            send: function(body: any) { this.body = body; return this; },
            statusCode: 0,
            body: null as any
        };

        it('should verify all error throwers', () => {
            const throwers: Array<keyof typeof error> = [
                'throwAccountSuspendedError',
                'throwAccountBlockedError',
                'throwAccountInactiveError',
                'throwValidationFailureError',
                'throwRecordExistError',
                'throwWrongCredentialsError',
                'throwLoginRequiredError',
                'throwRecordNotFoundError',
                'throwRecordNotSavedError',
                'throwUpdateFailedError',
                'throwTransactionFailedError',
                'throwUsedTokenError',
                'throwBadVisitorTokenError',
                'throwFileFormatNotSupportedError',
                'throwNotAuthorizedError',
                'throwBadInputError',
                'throwInputNotUuidError',
                'throwFileTooLargeError',
                'throwInvalidTimeValueError'
            ];

            throwers.forEach(name => {
                const fn = error[name] as Function;
                assert.throws(() => fn({ userMessage: 'test message', details: { foo: 'bar' } }), (err: any) => {
                    return err instanceof Error && (err as any).userMessage === 'test message' && (err as any).details.foo === 'bar';
                }, `Failed to verify ${name}`);
            });
        });

        it('should verify notFound404 middleware', () => {
            const res = { ...mockRes };
            error.notFound404({}, res, () => {});
            assert.strictEqual(res.statusCode, 404);
            assert.strictEqual(res.body.error.code, 'NOT_FOUND');
        });

        it('should verify appErrorHandler middleware', () => {
            const res = { ...mockRes };
            const err = { message: 'Account_Suspended', code: 'ACCOUNT_SUSPENDED', userMessage: 'suspended', details: { id: 1 } };
            error.appErrorHandler(err, {}, res, () => {});
            assert.strictEqual(res.statusCode, 403);
            assert.strictEqual(res.body.error.code, 'ACCOUNT_SUSPENDED');
            assert.strictEqual(res.body.error.message, 'suspended');
            assert.deepStrictEqual(res.body.error.details, { id: 1 });
        });

        it('should verify appErrorHandler default case', () => {
            const res = { ...mockRes };
            const err = new Error('Unknown');
            error.appErrorHandler(err, {}, res, () => {});
            assert.strictEqual(res.statusCode, 500);
        });
    });

    describe('resCode functions', () => {
        const mockRes = {
            set: function(headers: any) { this.headers = headers; return this; },
            status: function(code: number) { this.statusCode = code; return this; },
            headers: {} as any,
            statusCode: 0
        };

        it('should verify setOk200', () => {
            const res = { ...mockRes };
            const result = resCode.setOk200(res, 'etag-123');
            assert.strictEqual(result, res);
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.headers.ETag, 'etag-123');
        });

        it('should verify setCreated201', () => {
            const res = { ...mockRes };
            const result = resCode.setCreated201(res);
            assert.strictEqual(result, res);
            assert.strictEqual(res.statusCode, 201);
        });

        it('should verify setBadRequest400ClientError', () => {
            const res = { ...mockRes };
            const result = resCode.setBadRequest400ClientError(res);
            assert.strictEqual(result, res);
            assert.strictEqual(res.statusCode, 400);
        });
    });
});
