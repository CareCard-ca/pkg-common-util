import * as assert from 'assert';
import commonUtil from '../index.js';
const {
  util,
  error,
  resCode,
  createTracePropagationHeaders,
  getActiveTraceMetadata,
  requestContext,
  sendResponse,
  createError,
  caseConverter,
  keysToCamelCase,
  keysToSnakeCase
} = commonUtil;
import src from '../src/index.js';

/**
 * Pagination information
 */
export interface ApiPagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Standard API response metadata.
 */
export interface ApiResponseMeta {
  version?: string;
  service?: string;
  environment?: string;
  timestamp?: string;
  requestId?: string;
  traceId?: string;
  client?: {
    appId?: string;
    ip?: string;
  };
  pagination?: ApiPagination | null;
  [key: string]: unknown;
}

/**
 * Standard API error object.
 */
export interface ApiError {
  code?: string;
  details?: unknown;
  message?: string;
  fields?: Record<string, unknown> | null;
}

/**
 * Standard API response body.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  status?: 'success' | 'error';
  statusCode: number;
  code?: string;
  message: string;
  data: T | null;
  error?: ApiError | null;
  details?: unknown;
  meta?: ApiResponseMeta;
}

export interface ApiRequestContext {
  requestId?: string;
  traceId?: string;
  client?: Record<string, unknown>;
}

export interface ApiResponseWriter {
  status(statusCode: number): ApiResponseWriter;
  json(body: unknown): unknown;
  send(body?: unknown): unknown;
}

/**
 * Parameters for sendResponse utility.
 */
export interface SendResponseParams<T = unknown> {
  req: ApiRequestContext;
  res: ApiResponseWriter;
  statusCode?: number;
  success?: boolean;
  code?: string;
  message?: string;
  data?: T | null;
  error?: ApiError | null;
  details?: unknown;
  pagination?: ApiPagination | null;
  meta?: Partial<ApiResponseMeta>;
}

/**
 * Parameters for createError utility.
 */
export interface CreateErrorParams {
  code: string;
  details?: unknown;
  message?: string;
  fields?: Record<string, unknown> | null;
}

interface ContextualError extends Error {
  userMessage?: unknown;
  details?: unknown;
}

interface RequestContextFixture extends ApiRequestContext {
  headers: Record<string, string>;
  socket: {
    remoteAddress: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isApiResponse(value: unknown): value is ApiResponse {
  return (
    isRecord(value) &&
    typeof value.success === 'boolean' &&
    typeof value.statusCode === 'number' &&
    typeof value.message === 'string'
  );
}

function isContextualError(value: unknown): value is ContextualError {
  return value instanceof Error;
}

function createMockResponse() {
  return {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    send(body?: unknown) {
      this.body = body;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    }
  };
}

describe('pkg-common-util TypeScript Type Definitions', () => {
  it('should verify src index exports', () => {
    assert.ok(src.util);
    assert.ok(src.error);
    assert.ok(src.resCode);
    assert.ok(src.caseConverter);
    assert.ok(src.createTracePropagationHeaders);
    assert.ok(src.getActiveTraceMetadata);
    assert.ok(src.requestContext);
    assert.ok(src.sendResponse);
    assert.ok(src.createError);
  });

  it('should verify caseConverter functions', () => {
    const input = { first_name: 'John' };
    const camel = keysToCamelCase(input);
    assert.deepStrictEqual(camel, { firstName: 'John' });

    const snake = keysToSnakeCase(camel);
    assert.deepStrictEqual(snake, { first_name: 'John' });

    assert.ok(caseConverter.keysToCamelCase);
    assert.ok(caseConverter.keysToSnakeCase);
  });

  it('should verify util functions', () => {
    const source = { a: 1, b: 2, c: 3 };
    const result: Record<string, unknown> = util.extractObjectWithProperties(source, [
      'a',
      'c',
      'nonexistent'
    ]);
    assert.deepStrictEqual(result, { a: 1, c: 3 });

    assert.deepStrictEqual(util.extractObjectWithProperties(null, ['a']), {});
    assert.deepStrictEqual(util.extractObjectWithProperties(undefined, ['a']), {});
  });

  describe('error functions', () => {
    it('should verify all error throwers', () => {
      type ErrorThrower = (params?: { userMessage?: string; details?: unknown }) => never;
      const throwers: Array<[string, ErrorThrower]> = [
        ['throwAccountSuspendedError', error.throwAccountSuspendedError],
        ['throwAccountBlockedError', error.throwAccountBlockedError],
        ['throwAccountInactiveError', error.throwAccountInactiveError],
        ['throwValidationFailureError', error.throwValidationFailureError],
        ['throwRecordExistError', error.throwRecordExistError],
        ['throwWrongCredentialsError', error.throwWrongCredentialsError],
        ['throwLoginRequiredError', error.throwLoginRequiredError],
        ['throwRecordNotFoundError', error.throwRecordNotFoundError],
        ['throwRecordNotSavedError', error.throwRecordNotSavedError],
        ['throwUpdateFailedError', error.throwUpdateFailedError],
        ['throwTransactionFailedError', error.throwTransactionFailedError],
        ['throwUsedTokenError', error.throwUsedTokenError],
        ['throwBadVisitorTokenError', error.throwBadVisitorTokenError],
        ['throwFileFormatNotSupportedError', error.throwFileFormatNotSupportedError],
        ['throwNotAuthorizedError', error.throwNotAuthorizedError],
        ['throwBadInputError', error.throwBadInputError],
        ['throwInputNotUuidError', error.throwInputNotUuidError],
        ['throwFileTooLargeError', error.throwFileTooLargeError],
        ['throwInvalidTimeValueError', error.throwInvalidTimeValueError]
      ];

      throwers.forEach(([name, fn]) => {
        assert.throws(
          () => fn({ userMessage: 'test message', details: { foo: 'bar' } }),
          (err: unknown) => {
            return (
              isContextualError(err) &&
              err.userMessage === 'test message' &&
              isRecord(err.details) &&
              err.details.foo === 'bar'
            );
          },
          `Failed to verify ${String(name)}`
        );

        // Test without params to cover default values and branches
        assert.throws(
          () => fn(),
          (err: unknown) => {
            return isContextualError(err) && err.userMessage === null && err.details === null;
          },
          `Failed to verify ${String(name)} without params`
        );
      });
    });

    it('should verify notFound404 middleware', () => {
      const res = createMockResponse();
      error.notFound404({}, res, () => {});
      assert.strictEqual(res.statusCode, 404);
      assert.ok(isApiResponse(res.body));
      const response = res.body;
      assert.strictEqual(response.error?.code, 'NOT_FOUND');
    });

    it('should verify appErrorHandler middleware', () => {
      const res = createMockResponse();
      const err = {
        message: 'Account_Suspended',
        code: 'ACCOUNT_SUSPENDED',
        userMessage: 'suspended',
        details: { id: 1 }
      };
      error.appErrorHandler(err, {}, res, () => {});
      assert.strictEqual(res.statusCode, 403);
      assert.ok(isApiResponse(res.body));
      const response = res.body;
      assert.strictEqual(response.error?.code, 'ACCOUNT_SUSPENDED');
      assert.strictEqual(response.error?.message, 'suspended');
      assert.deepStrictEqual(response.error?.details, { id: 1 });

      // Test with minimal error object to cover ?? null branches
      const res2 = createMockResponse();
      error.appErrorHandler(new Error('Account_Suspended'), {}, res2, () => {});
      assert.strictEqual(res2.statusCode, 403);
      assert.ok(isApiResponse(res2.body));
      assert.strictEqual(res2.body.error?.code, 'UNEXPECTED_ERROR');
      assert.strictEqual(res2.body.error?.message, 'Account_Suspended');
      assert.strictEqual(res2.body.error?.details, null);
    });

    it('should verify appErrorHandler default case', () => {
      const res = createMockResponse();
      const err = new Error('Unknown');
      error.appErrorHandler(err, {}, res, () => {});
      assert.strictEqual(res.statusCode, 500);
    });

    it('should verify appErrorHandler with null error', () => {
      const res = createMockResponse();
      error.appErrorHandler(null, {}, res, () => {});
      assert.strictEqual(res.statusCode, 500);
      assert.ok(isApiResponse(res.body));
      assert.strictEqual(res.body.message, 'Internal server error');
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
        const res = createMockResponse();
        const err = new Error(message);
        error.appErrorHandler(err, {}, res, () => {});
        assert.strictEqual(res.statusCode, expectedStatus, `Failed for ${message}`);
      });
    });
  });

  describe('resCode functions', () => {
    const mockRes = {
      set: function (headers: Record<string, string>) {
        this.headers = headers;
        return this;
      },
      status: function (code: number) {
        this.statusCode = code;
        return this;
      },
      headers: {} as Record<string, string>,
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
    it('should verify requestContext middleware', (done: Mocha.Done) => {
      const req: RequestContextFixture = {
        headers: {},
        socket: { remoteAddress: '127.0.0.1' }
      };
      const responseHeaders: Record<string, string> = {};
      requestContext(
        req,
        {
          setHeader(name: string, value: string) {
            responseHeaders[name] = value;
          }
        },
        () => {
          assert.ok(req.requestId);
          assert.ok(req.traceId);
          assert.strictEqual(getActiveTraceMetadata().traceId, req.traceId);
          assert.strictEqual(
            createTracePropagationHeaders().traceparent,
            responseHeaders.traceparent
          );
          done();
        }
      );
    });

    it('should verify sendResponse utility', (done: Mocha.Done) => {
      const req = { requestId: 'req-1', traceId: 'trace-1', client: {} };
      const res = createMockResponse();

      const params: SendResponseParams = {
        req,
        res,
        message: 'Test',
        meta: {
          pagination: { page: 1, pageSize: 10, total: 100, totalPages: 10 }
        }
      };

      sendResponse(params);
      assert.strictEqual(res.statusCode, 200);
      assert.ok(isApiResponse(res.body));
      const response = res.body;
      assert.strictEqual(response.message, 'Test');
      assert.ok(response.meta);
      assert.strictEqual(response.meta!.requestId, 'req-1');
      assert.deepStrictEqual(response.meta!.pagination, {
        page: 1,
        pageSize: 10,
        total: 100,
        totalPages: 10
      });
      done();
    });

    it('should verify sendResponse utility with defaults', (done: Mocha.Done) => {
      const oldApiVersion = process.env.API_VERSION;
      const oldServiceName = process.env.SERVICE_NAME;
      const oldNodeEnv = process.env.NODE_ENV;

      delete process.env.API_VERSION;
      delete process.env.SERVICE_NAME;
      delete process.env.NODE_ENV;

      const req = {};
      const res = createMockResponse();

      sendResponse({ req, res });
      assert.strictEqual(res.statusCode, 200);
      assert.ok(isApiResponse(res.body));
      assert.strictEqual(res.body.meta?.version, '1.0.0');
      assert.strictEqual(res.body.meta?.service, 'unknown-service');
      assert.strictEqual(res.body.meta?.environment, 'development');
      assert.strictEqual(res.body.meta?.requestId, '');
      assert.strictEqual(res.body.meta?.traceId, '');
      assert.deepStrictEqual(res.body.meta?.client, {});

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
          pageSize: 10,
          total: 100,
          totalPages: 10
        },
        customField: 'customValue'
      };
      assert.strictEqual(meta.customField, 'customValue');
    });
  });
});
