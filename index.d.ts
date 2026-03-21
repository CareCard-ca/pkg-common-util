/**
 * Utility functions for object manipulation.
 */
export const util: {
  /**
   * Creates a new object containing only the specified properties from the source object.
   * @param obj - The source object.
   * @param arrayOfProperties - An array of property names to extract.
   * @returns A new object with the extracted properties.
   */
  extractObjectWithProperties: (obj: any, arrayOfProperties: string[]) => Record<string, any>;
};

/**
 * Application-level error handlers and throwers.
 */
export const error: {
  /** Throws an Account_Suspended error. */
  throwAccountSuspendedError: (params?: { userMessage?: string, details?: any }) => never;
  /** Throws an Account_Blocked error. */
  throwAccountBlockedError: (params?: { userMessage?: string, details?: any }) => never;
  /** Throws an Account_Inactive error. */
  throwAccountInactiveError: (params?: { userMessage?: string, details?: any }) => never;
  /** Middleware to handle 404 Not Found. */
  notFound404: (req: any, res: any, next: any) => void;
  /** Central application error handler middleware. */
  appErrorHandler: (err: any, req: any, res: any, next: any) => void;
  /** Throws a Validation_Failure error. */
  throwValidationFailureError: (params?: { userMessage?: string, details?: any }) => never;
  /** Throws a Record_Exist error. */
  throwRecordExistError: (params?: { userMessage?: string, details?: any }) => never;
  /** Throws a Wrong_Credentials error. */
  throwWrongCredentialsError: (params?: { userMessage?: string, details?: any }) => never;
  /** Throws a Login_Required error. */
  throwLoginRequiredError: (params?: { userMessage?: string, details?: any }) => never;
  /** Throws a Record_NotFound error. */
  throwRecordNotFoundError: (params?: { userMessage?: string, details?: any }) => never;
  /** Throws a Record_NotSaved error. */
  throwRecordNotSavedError: (params?: { userMessage?: string, details?: any }) => never;
  /** Throws an Update_Failed error. */
  throwUpdateFailedError: (params?: { userMessage?: string, details?: any }) => never;
  /** Throws a Transaction_Failed error. */
  throwTransactionFailedError: (params?: { userMessage?: string, details?: any }) => never;
  /** Throws a Used_Token error. */
  throwUsedTokenError: (params?: { userMessage?: string, details?: any }) => never;
  /** Throws a Bad_Visitor_Token error. */
  throwBadVisitorTokenError: (params?: { userMessage?: string, details?: any }) => never;
  /** Throws a File_Format_Not_Supported error. */
  throwFileFormatNotSupportedError: (params?: { userMessage?: string, details?: any }) => never;
  /** Throws a Not_Authorized error. */
  throwNotAuthorizedError: (params?: { userMessage?: string, details?: any }) => never;
  /** Throws a Bad_Input error. */
  throwBadInputError: (params?: { userMessage?: string, details?: any }) => never;
  /** Throws an Input_Not_Uuid error. */
  throwInputNotUuidError: (params?: { userMessage?: string, details?: any }) => never;
  /** Throws a File_Too_Large error. */
  throwFileTooLargeError: (params?: { userMessage?: string, details?: any }) => never;
  /** Throws an Invalid_Time_Value error. */
  throwInvalidTimeValueError: (params?: { userMessage?: string, details?: any }) => never;
};

/**
 * Utility functions for setting HTTP response status codes and headers.
 */
export const resCode: {
  /** Sets 200 OK status and optionally an ETag header. */
  setOk200: (res: any, ETag?: string) => any;
  /** Sets 201 Created status. */
  setCreated201: (res: any) => any;
  /** Sets 400 Bad Request status. */
  setBadRequest400ClientError: (res: any) => any;
};
