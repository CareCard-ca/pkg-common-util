import assert from 'assert';
import {describe, it} from 'mocha';
import {util, error, resCode, requestContext, sendResponse, createError} from '../index';
// @ts-ignore
import * as src from '../src/index';
import { ApiResponse, ApiResponseMeta, ApiError, SendResponseParams, CreateErrorParams } from '../src/types/response.types';

describe('pkg-common-util TypeScript Type Definitions', () => {
    it('should verify src index exports', () => {
        assert.ok(src.util);
        assert.ok(src.error);
        assert.ok(src.resCode);
        assert.ok(src.requestContext);
        assert.ok(src.sendResponse);
        assert.ok(src.createError);
    });

    it('should verify util functions', () => {
        const source = { a: 1, b: 2, c: 3 };
        const result: Record<string, any> = util.extractObjectWithProperties(source, ['a', 'c', 'nonexistent']);
        assert.deepStrictEqual(result, { a: 1, c: 3 });
        
        assert.deepStrictEqual(util.extractObjectWithProperties(null, ['a']), {});
        assert.deepStrictEqual(util.extractObjectWithProperties(undefined, ['a']), {});
    });

    describe('error functions', () => {
        const mockRes = {
            status: function(code: number) { this.statusCode = code; return this; },
            send: function(body: any) { this.body = body; return this; },
            json: function(body: any) { this.body = body; return this; },
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
                
                // Test without params to cover default values and branches
                assert.throws(() => fn(), (err: any) => {
                    return err instanceof Error && (err as any).userMessage === null && (err as any).details === null;
                }, `Failed to verify ${name} without params`);
            });
        });

        it('should verify notFound404 middleware', () => {
            const res = { ...mockRes };
            error.notFound404({}, res, () => {});
            assert.strictEqual(res.statusCode, 404);
            const response: ApiResponse = res.body;
            assert.strictEqual(response.error?.code, 'NOT_FOUND');
        });

        it('should verify appErrorHandler middleware', () => {
            const res = { ...mockRes };
            const err = { message: 'Account_Suspended', code: 'ACCOUNT_SUSPENDED', userMessage: 'suspended', details: { id: 1 } };
            error.appErrorHandler(err, {}, res, () => {});
            assert.strictEqual(res.statusCode, 403);
            const response: ApiResponse = res.body;
            assert.strictEqual(response.error?.code, 'ACCOUNT_SUSPENDED');
            assert.strictEqual(response.error?.message, 'suspended');
            assert.deepStrictEqual(response.error?.details, { id: 1 });
            
            // Test with minimal error object to cover ?? null branches
            const res2 = { ...mockRes };
            error.appErrorHandler(new Error('Account_Suspended'), {}, res2, () => {});
            assert.strictEqual(res2.statusCode, 403);
            assert.strictEqual(res2.body.error.code, null);
            assert.strictEqual(res2.body.error.message, null);
            assert.strictEqual(res2.body.error.details, null);
        });

        it('should verify appErrorHandler default case', () => {
            const res = { ...mockRes };
            const err = new Error('Unknown');
            error.appErrorHandler(err, {}, res, () => {});
            assert.strictEqual(res.statusCode, 500);
        });

        it('should verify appErrorHandler with null error', () => {
            const res = { ...mockRes };
            // @ts-ignore
            error.appErrorHandler(null, {}, res, () => {});
            assert.strictEqual(res.statusCode, 500);
            assert.strictEqual(res.body.message, 'Internal Server Error');
        });

        it('should verify appErrorHandler for all common error types', () => {
            const cases = [
                { message: 'Validation_Failure', expectedStatus: 401 },
                { message: 'Used_Token', expectedStatus: 401 },
                { message: 'Wrong_Credentials', expectedStatus: 401 },
                { message: 'Bad_Visitor_Token', expectedStatus: 401 },
                { message: 'Record_NotSaved', expectedStatus: 400 },
                { message: 'Record_Exist', expectedStatus: 409 },
                { message: 'Record_NotFound', expectedStatus: 404 },
                { message: 'Update_Failed', expectedStatus: 400 },
                { message: 'Login_Required', expectedStatus: 401 },
                { message: 'Transaction_Failed', expectedStatus: 400 },
                { message: 'File_Format_Not_Supported', expectedStatus: 415 },
                { message: 'Not_Authorized', expectedStatus: 401 },
                { message: 'Bad_Input', expectedStatus: 400 },
                { message: 'Input_Not_Uuid', expectedStatus: 400 },
                { message: 'File too large', expectedStatus: 413 },
                { message: 'Invalid time value', expectedStatus: 403 }
            ];

            cases.forEach(({ message, expectedStatus }) => {
                const res = { ...mockRes };
                const err = new Error(message);
                error.appErrorHandler(err, {}, res, () => {});
                assert.strictEqual(res.statusCode, expectedStatus, `Failed for ${message}`);
            });
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

    describe('Standardized API Response System', () => {
        it('should verify requestContext middleware', (done) => {
            const req: any = { headers: {}, socket: { remoteAddress: '127.0.0.1' } };
            requestContext(req, {}, () => {
                assert.ok(req.requestId);
                assert.ok(req.traceId);
                done();
            });
        });

        it('should verify sendResponse utility', (done) => {
            const req = { requestId: 'req-1', traceId: 'trace-1', client: {} };
            const res: any = {
                status: function(code: number) { this.statusCode = code; return this; },
                json: function(body: any) { this.body = body; return this; }
            };
            
            const params: SendResponseParams = { 
                req, 
                res, 
                message: 'Test',
                meta: {
                    pagination: { page: 1, limit: 10, total: 100 }
                }
            };
            
            sendResponse(params);
            assert.strictEqual(res.statusCode, 200);
            const response: ApiResponse = res.body;
            assert.strictEqual(response.message, 'Test');
            assert.strictEqual(response.meta.requestId, 'req-1');
            assert.deepStrictEqual(response.meta.pagination, { page: 1, limit: 10, total: 100 });
            done();
        });

        it('should verify sendResponse utility with defaults', (done) => {
            const oldApiVersion = process.env.API_VERSION;
            const oldServiceName = process.env.SERVICE_NAME;
            const oldNodeEnv = process.env.NODE_ENV;
            
            delete process.env.API_VERSION;
            delete process.env.SERVICE_NAME;
            delete process.env.NODE_ENV;

            const req = {};
            const res: any = {
                status: function(code: number) { this.statusCode = code; return this; },
                json: function(body: any) { this.body = body; return this; }
            };
            
            sendResponse({ req, res });
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.meta.version, '1.0.0');
            assert.strictEqual(res.body.meta.service, 'unknown-service');
            assert.strictEqual(res.body.meta.environment, 'development');
            assert.strictEqual(res.body.meta.requestId, '');
            assert.strictEqual(res.body.meta.traceId, '');
            assert.deepStrictEqual(res.body.meta.client, {});
            
            // Restore env
            if (oldApiVersion) process.env.API_VERSION = oldApiVersion;
            if (oldServiceName) process.env.SERVICE_NAME = oldServiceName;
            if (oldNodeEnv) process.env.NODE_ENV = oldNodeEnv;
            done();
        });

        it('should verify createError utility', () => {
            const params: CreateErrorParams = { 
                code: 'TEST_ERR', 
                details: 'test',
                fields: { field1: 'invalid' }
            };
            const err: ApiError = createError(params);
            assert.strictEqual(err.code, 'TEST_ERR');
            assert.strictEqual(err.details, 'test');
            assert.deepStrictEqual(err.fields, { field1: 'invalid' });
        });

        it('should verify complex ApiResponseMeta', () => {
            const meta: ApiResponseMeta = {
                version: '1.0.0',
                service: 'test',
                environment: 'dev',
                timestamp: 'now',
                requestId: 'rid',
                traceId: 'tid',
                client: {
                    appId: 'aid',
                    ip: '1.2.3.4'
                },
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 100
                },
                customField: 'customValue'
            };
            assert.strictEqual(meta.customField, 'customValue');
        });
    });
});
