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
  throwAccountSuspendedError: (userMessage?: string, details?: any) => never;
  /** Throws an Account_Blocked error. */
  throwAccountBlockedError: (userMessage?: string, details?: any) => never;
  /** Throws an Account_Inactive error. */
  throwAccountInactiveError: (userMessage?: string, details?: any) => never;
  /** Middleware to handle 404 Not Found. */
  notFound404: (req: any, res: any, next: any) => void;
  /** Central application error handler middleware. */
  appErrorHandler: (err: any, req: any, res: any, next: any) => void;
  /** Throws a Validation_Failure error. */
  throwValidationFailureError: (userMessage?: string, details?: any) => never;
  /** Throws a Record_Exist error. */
  throwRecordExistError: (userMessage?: string, details?: any) => never;
  /** Throws a Wrong_Credentials error. */
  throwWrongCredentialsError: (userMessage?: string, details?: any) => never;
  /** Throws a Login_Required error. */
  throwLoginRequiredError: (userMessage?: string, details?: any) => never;
  /** Throws a Record_NotFound error. */
  throwRecordNotFoundError: (userMessage?: string, details?: any) => never;
  /** Throws a Record_NotSaved error. */
  throwRecordNotSavedError: (userMessage?: string, details?: any) => never;
  /** Throws an Update_Failed error. */
  throwUpdateFailedError: (userMessage?: string, details?: any) => never;
  /** Throws a Transaction_Failed error. */
  throwTransactionFailedError: (userMessage?: string, details?: any) => never;
  /** Throws a Used_Token error. */
  throwUsedTokenError: (userMessage?: string, details?: any) => never;
  /** Throws a Bad_Visitor_Token error. */
  throwBadVisitorTokenError: (userMessage?: string, details?: any) => never;
  /** Throws a File_Format_Not_Supported error. */
  throwFileFormatNotSupportedError: (userMessage?: string, details?: any) => never;
  /** Throws a Not_Authorized error. */
  throwNotAuthorizedError: (userMessage?: string, details?: any) => never;
  /** Throws a Bad_Input error. */
  throwBadInputError: (userMessage?: string, details?: any) => never;
  /** Throws an Input_Not_Uuid error. */
  throwInputNotUuidError: (userMessage?: string, details?: any) => never;
  /** Throws a File_Too_Large error. */
  throwFileTooLargeError: (userMessage?: string, details?: any) => never;
  /** Throws an Invalid_Time_Value error. */
  throwInvalidTimeValueError: (userMessage?: string, details?: any) => never;
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
