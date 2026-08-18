/**
 * Creates a new object containing only the specified properties from the source object.
 * @param obj - The source object.
 * @param arrayOfProperties - An array of property names to extract.
 * @returns A new object with the extracted properties.
 */
export function extractObjectWithProperties(
  obj: unknown,
  arrayOfProperties: string[],
): Record<string, unknown>;

/**
 * Converts all keys of an object or array of objects to camelCase.
 * Handles nested objects and arrays.
 * @param input - The source object or array.
 * @returns A new object or array with camelCase keys.
 */
export function keysToCamelCase<T>(input: T): T;

/**
 * Converts all keys of an object or array of objects to snake_case.
 * Handles nested objects and arrays.
 * @param input - The source object or array.
 * @returns A new object or array with snake_case keys.
 */
export function keysToSnakeCase<T>(input: T): T;

/**
 * Utility functions for object manipulation.
 * @deprecated Use direct imports instead.
 */
export const util: {
  extractObjectWithProperties: typeof extractObjectWithProperties;
};

/**
 * Key case conversion utilities.
 * @deprecated Use direct imports instead.
 */
export const caseConverter: {
  keysToCamelCase: typeof keysToCamelCase;
  keysToSnakeCase: typeof keysToSnakeCase;
};

/** Throws an Account_Suspended error. */
export function throwAccountSuspendedError(params?: {
  userMessage?: string;
  details?: unknown;
}): never;
/** Throws an Account_Blocked error. */
export function throwAccountBlockedError(params?: {
  userMessage?: string;
  details?: unknown;
}): never;
/** Throws an Account_Inactive error. */
export function throwAccountInactiveError(params?: {
  userMessage?: string;
  details?: unknown;
}): never;
/** Middleware to handle 404 Not Found. */
export function notFound404(req: unknown, res: unknown, next: unknown): void;
/** Central application error handler middleware. */
export function appErrorHandler(err: unknown, req: unknown, res: unknown, next: unknown): void;
/** Throws a Validation_Failure error. */
export function throwValidationFailureError(params?: {
  userMessage?: string;
  details?: unknown;
}): never;
/** Throws a Record_Exist error. */
export function throwRecordExistError(params?: { userMessage?: string; details?: unknown }): never;
/** Throws a Wrong_Credentials error. */
export function throwWrongCredentialsError(params?: {
  userMessage?: string;
  details?: unknown;
}): never;
/** Throws a Login_Required error. */
export function throwLoginRequiredError(params?: {
  userMessage?: string;
  details?: unknown;
}): never;
/** Throws a Record_NotFound error. */
export function throwRecordNotFoundError(params?: {
  userMessage?: string;
  details?: unknown;
}): never;
/** Throws a Record_NotSaved error. */
export function throwRecordNotSavedError(params?: {
  userMessage?: string;
  details?: unknown;
}): never;
/** Throws an Update_Failed error. */
export function throwUpdateFailedError(params?: { userMessage?: string; details?: unknown }): never;
/** Throws a Transaction_Failed error. */
export function throwTransactionFailedError(params?: {
  userMessage?: string;
  details?: unknown;
}): never;
/** Throws a Used_Token error. */
export function throwUsedTokenError(params?: { userMessage?: string; details?: unknown }): never;
/** Throws a Bad_Visitor_Token error. */
export function throwBadVisitorTokenError(params?: {
  userMessage?: string;
  details?: unknown;
}): never;
/** Throws a File_Format_Not_Supported error. */
export function throwFileFormatNotSupportedError(params?: {
  userMessage?: string;
  details?: unknown;
}): never;
/** Throws a Not_Authorized error. */
export function throwNotAuthorizedError(params?: {
  userMessage?: string;
  details?: unknown;
}): never;
/** Throws a Bad_Input error. */
export function throwBadInputError(params?: { userMessage?: string; details?: unknown }): never;
/** Throws an Input_Not_Uuid error. */
export function throwInputNotUuidError(params?: { userMessage?: string; details?: unknown }): never;
/** Throws a File_Too_Large error. */
export function throwFileTooLargeError(params?: { userMessage?: string; details?: unknown }): never;
/** Throws an Invalid_Time_Value error. */
export function throwInvalidTimeValueError(params?: {
  userMessage?: string;
  details?: unknown;
}): never;
/** Throws a Not_Found error. */
export function throwNotFoundError(params?: { userMessage?: string; details?: unknown }): never;
/** Throws a Record_Save_Failure error. */
export function throwRecordSaveFailureError(params?: {
  userMessage?: string;
  details?: unknown;
}): never;
/** Throws an Application_Error error. */
export function throwApplicationError(params?: { userMessage?: string; details?: unknown }): never;
/** Throws a Network_Error error. */
export function throwNetworkError(params?: { userMessage?: string; details?: unknown }): never;
/** Throws an Unexpected_Error error. */
export function throwUnexpectedError(params?: { userMessage?: string; details?: unknown }): never;

/**
 * Application-level error handlers and throwers.
 * @deprecated Use direct imports instead.
 */
export const error: {
  throwAccountSuspendedError: typeof throwAccountSuspendedError;
  throwAccountBlockedError: typeof throwAccountBlockedError;
  throwAccountInactiveError: typeof throwAccountInactiveError;
  notFound404: typeof notFound404;
  appErrorHandler: typeof appErrorHandler;
  throwValidationFailureError: typeof throwValidationFailureError;
  throwRecordExistError: typeof throwRecordExistError;
  throwWrongCredentialsError: typeof throwWrongCredentialsError;
  throwLoginRequiredError: typeof throwLoginRequiredError;
  throwRecordNotFoundError: typeof throwRecordNotFoundError;
  throwRecordNotSavedError: typeof throwRecordNotSavedError;
  throwUpdateFailedError: typeof throwUpdateFailedError;
  throwTransactionFailedError: typeof throwTransactionFailedError;
  throwUsedTokenError: typeof throwUsedTokenError;
  throwBadVisitorTokenError: typeof throwBadVisitorTokenError;
  throwFileFormatNotSupportedError: typeof throwFileFormatNotSupportedError;
  throwNotAuthorizedError: typeof throwNotAuthorizedError;
  throwBadInputError: typeof throwBadInputError;
  throwInputNotUuidError: typeof throwInputNotUuidError;
  throwFileTooLargeError: typeof throwFileTooLargeError;
  throwInvalidTimeValueError: typeof throwInvalidTimeValueError;
  throwNotFoundError: typeof throwNotFoundError;
  throwRecordSaveFailureError: typeof throwRecordSaveFailureError;
  throwApplicationError: typeof throwApplicationError;
  throwNetworkError: typeof throwNetworkError;
  throwUnexpectedError: typeof throwUnexpectedError;
};

/** Sets 200 OK status and optionally an ETag header. */
export function setOk200(res: unknown, ETag?: string): unknown;
/** Sets 201 Created status. */
export function setCreated201(res: unknown): unknown;
/** Sets 400 Bad Request status. */
export function setBadRequest400ClientError(res: unknown): unknown;

/**
 * Utility functions for setting HTTP response status codes and headers.
 * @deprecated Use direct imports instead.
 */
export const resCode: {
  setOk200: typeof setOk200;
  setCreated201: typeof setCreated201;
  setBadRequest400ClientError: typeof setBadRequest400ClientError;
};

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
 * W3C trace metadata active for the current service request.
 */
export interface TraceMetadata {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  traceFlags: string;
}

/**
 * Headers used to continue the active W3C trace in a downstream service.
 */
export interface TracePropagationHeaders {
  traceparent?: string;
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

/**
 * Express middleware to generate and attach request context.
 */
export function requestContext(req: unknown, res: unknown, next: unknown): void;

/**
 * Returns the W3C trace metadata active in the current asynchronous request context.
 */
export function getActiveTraceMetadata(): Partial<TraceMetadata>;

/**
 * Returns a traceparent header for a downstream request when trace context is active.
 */
export function createTracePropagationHeaders(): TracePropagationHeaders;

/**
 * Standardized API response utility.
 */
export function sendResponse<T = unknown>(params: {
  req: unknown;
  res: unknown;
  statusCode?: number;
  success?: boolean;
  code?: string;
  message?: string;
  data?: T | null;
  error?: ApiError | null;
  details?: unknown;
  pagination?: ApiPagination | null;
  meta?: Partial<ApiResponseMeta>;
}): unknown;

/**
 * Helper for standardized errors.
 */
export function createError(params: {
  code: string;
  details?: unknown;
  message?: string;
  fields?: Record<string, unknown> | null;
}): ApiError;

/**
 * Standard API error codes.
 */
export enum ApiErrorType {
  VALIDATION_FAILURE = 'VALIDATION_FAILURE',
  WRONG_CREDENTIALS = 'WRONG_CREDENTIALS',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  RECORD_NOT_SAVED = 'RECORD_NOT_SAVED',
  RECORD_SAVE_FAILURE = 'RECORD_SAVE_FAILURE',
  APPLICATION_ERROR = 'APPLICATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  LOGIN_REQUIRED = 'LOGIN_REQUIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  ACCOUNT_BLOCKED = 'ACCOUNT_BLOCKED',
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
  RECORD_EXIST = 'RECORD_EXIST',
  UPDATE_FAILED = 'UPDATE_FAILED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  USED_TOKEN = 'USED_TOKEN',
  BAD_VISITOR_TOKEN = 'BAD_VISITOR_TOKEN',
  FILE_FORMAT_NOT_SUPPORTED = 'FILE_FORMAT_NOT_SUPPORTED',
  NOT_AUTHORIZED = 'NOT_AUTHORIZED',
  BAD_INPUT = 'BAD_INPUT',
  INPUT_NOT_UUID = 'INPUT_NOT_UUID',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_TIME_VALUE = 'INVALID_TIME_VALUE',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
}

/**
 * Extracts error message from standardized error data.
 */
export function getApiErrorMessage(errorData: unknown, t: (key: string) => string): string;

/**
 * Default export containing all utility and error handling functions.
 */
declare const commonUtil: {
  util: typeof util;
  error: typeof error;
  resCode: typeof resCode;
  caseConverter: typeof caseConverter;
  extractObjectWithProperties: typeof extractObjectWithProperties;
  keysToCamelCase: typeof keysToCamelCase;
  keysToSnakeCase: typeof keysToSnakeCase;
  throwAccountSuspendedError: typeof throwAccountSuspendedError;
  throwAccountBlockedError: typeof throwAccountBlockedError;
  throwAccountInactiveError: typeof throwAccountInactiveError;
  notFound404: typeof notFound404;
  appErrorHandler: typeof appErrorHandler;
  throwValidationFailureError: typeof throwValidationFailureError;
  throwRecordExistError: typeof throwRecordExistError;
  throwWrongCredentialsError: typeof throwWrongCredentialsError;
  throwLoginRequiredError: typeof throwLoginRequiredError;
  throwRecordNotFoundError: typeof throwRecordNotFoundError;
  throwRecordNotSavedError: typeof throwRecordNotSavedError;
  throwUpdateFailedError: typeof throwUpdateFailedError;
  throwTransactionFailedError: typeof throwTransactionFailedError;
  throwUsedTokenError: typeof throwUsedTokenError;
  throwBadVisitorTokenError: typeof throwBadVisitorTokenError;
  throwFileFormatNotSupportedError: typeof throwFileFormatNotSupportedError;
  throwNotAuthorizedError: typeof throwNotAuthorizedError;
  throwBadInputError: typeof throwBadInputError;
  throwInputNotUuidError: typeof throwInputNotUuidError;
  throwFileTooLargeError: typeof throwFileTooLargeError;
  throwInvalidTimeValueError: typeof throwInvalidTimeValueError;
  throwNotFoundError: typeof throwNotFoundError;
  throwRecordSaveFailureError: typeof throwRecordSaveFailureError;
  throwApplicationError: typeof throwApplicationError;
  throwNetworkError: typeof throwNetworkError;
  throwUnexpectedError: typeof throwUnexpectedError;
  setOk200: typeof setOk200;
  setCreated201: typeof setCreated201;
  setBadRequest400ClientError: typeof setBadRequest400ClientError;
  requestContext: typeof requestContext;
  createTracePropagationHeaders: typeof createTracePropagationHeaders;
  getActiveTraceMetadata: typeof getActiveTraceMetadata;
  sendResponse: typeof sendResponse;
  createError: typeof createError;
  ApiErrorType: typeof ApiErrorType;
  getApiErrorMessage: typeof getApiErrorMessage;
};

export default commonUtil;
