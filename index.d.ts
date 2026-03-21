/**
 * Creates a new object containing only the specified properties from the source object.
 * @param obj - The source object.
 * @param arrayOfProperties - An array of property names to extract.
 * @returns A new object with the extracted properties.
 */
export function extractObjectWithProperties(obj: any, arrayOfProperties: string[]): Record<string, any>;

/**
 * Utility functions for object manipulation.
 * @deprecated Use direct imports instead.
 */
export const util: {
  extractObjectWithProperties: typeof extractObjectWithProperties;
};

/** Throws an Account_Suspended error. */
export function throwAccountSuspendedError(params?: { userMessage?: string, details?: any }): never;
/** Throws an Account_Blocked error. */
export function throwAccountBlockedError(params?: { userMessage?: string, details?: any }): never;
/** Throws an Account_Inactive error. */
export function throwAccountInactiveError(params?: { userMessage?: string, details?: any }): never;
/** Middleware to handle 404 Not Found. */
export function notFound404(req: any, res: any, next: any): void;
/** Central application error handler middleware. */
export function appErrorHandler(err: any, req: any, res: any, next: any): void;
/** Throws a Validation_Failure error. */
export function throwValidationFailureError(params?: { userMessage?: string, details?: any }): never;
/** Throws a Record_Exist error. */
export function throwRecordExistError(params?: { userMessage?: string, details?: any }): never;
/** Throws a Wrong_Credentials error. */
export function throwWrongCredentialsError(params?: { userMessage?: string, details?: any }): never;
/** Throws a Login_Required error. */
export function throwLoginRequiredError(params?: { userMessage?: string, details?: any }): never;
/** Throws a Record_NotFound error. */
export function throwRecordNotFoundError(params?: { userMessage?: string, details?: any }): never;
/** Throws a Record_NotSaved error. */
export function throwRecordNotSavedError(params?: { userMessage?: string, details?: any }): never;
/** Throws an Update_Failed error. */
export function throwUpdateFailedError(params?: { userMessage?: string, details?: any }): never;
/** Throws a Transaction_Failed error. */
export function throwTransactionFailedError(params?: { userMessage?: string, details?: any }): never;
/** Throws a Used_Token error. */
export function throwUsedTokenError(params?: { userMessage?: string, details?: any }): never;
/** Throws a Bad_Visitor_Token error. */
export function throwBadVisitorTokenError(params?: { userMessage?: string, details?: any }): never;
/** Throws a File_Format_Not_Supported error. */
export function throwFileFormatNotSupportedError(params?: { userMessage?: string, details?: any }): never;
/** Throws a Not_Authorized error. */
export function throwNotAuthorizedError(params?: { userMessage?: string, details?: any }): never;
/** Throws a Bad_Input error. */
export function throwBadInputError(params?: { userMessage?: string, details?: any }): never;
/** Throws an Input_Not_Uuid error. */
export function throwInputNotUuidError(params?: { userMessage?: string, details?: any }): never;
/** Throws a File_Too_Large error. */
export function throwFileTooLargeError(params?: { userMessage?: string, details?: any }): never;
/** Throws an Invalid_Time_Value error. */
export function throwInvalidTimeValueError(params?: { userMessage?: string, details?: any }): never;

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
};

/** Sets 200 OK status and optionally an ETag header. */
export function setOk200(res: any, ETag?: string): any;
/** Sets 201 Created status. */
export function setCreated201(res: any): any;
/** Sets 400 Bad Request status. */
export function setBadRequest400ClientError(res: any): any;

/**
 * Utility functions for setting HTTP response status codes and headers.
 * @deprecated Use direct imports instead.
 */
export const resCode: {
  setOk200: typeof setOk200;
  setCreated201: typeof setCreated201;
  setBadRequest400ClientError: typeof setBadRequest400ClientError;
};
