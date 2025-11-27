'use strict';
/**
 * These are application level error handlers. All error responses should be send using these functions.
 * These should be use in app.js file, not in controller files.
 */
module.exports = {
    notFound404,
    appErrorHandler,
    throwValidationFailureError,
    throwRecordExistError,
    throwWrongCredentialsError,
    throwLoginRequiredError,
    throwRecordNotFoundError,
    throwRecordNotSavedError,
    throwUpdateFailedError,
    throwTransactionFailedError,
    throwUsedTokenError,
    throwBadVisitorTokenError: throwVisitorTokenError,
    throwFileFormatNotSupportedError,
    throwNotAuthorizedError,
    throwBadInputError,
    throwInputNotUuidError,
    throwFileTooLargeError,
    throwInvalidTimeValueError
}


function notFound404( req, res, next ) {
    res.status( 404 );
    const response = {
        error: 
            {
                code: 'NOT_FOUND',
                message: 'Not found',
                details: null
            }
    }

    res.send( response )
}

function appErrorHandler( err, req, res, next ) {
    const response = 
        {
            error: 
                {
                    code: err.code ?? null,
                    message: err.userMessage ?? null,
                    details: err.details ?? null
                }
        };

    switch ( err?.message ) {

        case "Validation_Failure":
            res.status( 401 );
            res.send( response )
            break;

        case "Used_Token":
        case "Wrong_Credentials":
            res.status( 401 );
            res.send( response )
            break;

        case "Bad_Visitor_Token":
            res.status( 401 );
            res.send( response )
            break;

        case "Record_NotSaved":
            res.status( 400 );
            res.send( response )
            break;

        case "Record_Exist":
            res.status( 409 );
            res.send( response )
            break;

        case "Record_NotFound":
            res.status( 404 );
            res.send( response )
            break;

        case "Update_Failed":
            res.status( 400 );
            res.send( response )
            break;

        case "Login_Required":
            res.status( 401 );
            res.send( response )
            break;

        case "Transaction_Failed":
            res.status( 400 );
            res.send( response )
            break;

        case "File_Format_Not_Supported":
            res.status( 415 );
            res.send( response )
            break;

        case "Not_Authorized":
            res.status( 401 );
            res.send( response )
            break;

        case "Bad_Input":
            res.status( 400 );
            res.send( response );
            break;

        case  "Input_Not_Uuid" :
            res.status( 400 );
            res.send( response )
            break;

        case "File too large":
            res.status( 413 );
            res.send( response )
            break;

        case "Invalid time value":
            res.status( 403 );
            res.send( response )
            break;

        default:
            res.status( 500 );
            res.send( response )
    }
}


function throwValidationFailureError(params={}) {
    const error = new Error( "Validation_Failure" );
    error.code = "VALIDATION_FAILURE";
    error.userMessage = params.userMessage ?? null;
    error.details = params.details ?? null;
    throw error;
}

function throwWrongCredentialsError(params={}) {
    const error = new Error( "Wrong_Credentials" );
    error.code = "WRONG_CREDENTIALS";
    error.userMessage = params.userMessage ?? null;
    error.details = params.details ?? null;
    throw error;
}

function throwRecordExistError(params={}) {
    const error = new Error( "Record_Exist" );
    error.code = "RECORD_EXIST";
    error.userMessage = params.userMessage ?? null;
    error.details = params.details ?? null;
    throw error;
}

function throwRecordNotFoundError(params={}) {
    const error = new Error( "Record_NotFound" );
    error.code = "RECORD_NOT_FOUND";
    error.userMessage = params.userMessage ?? null;
    error.details = params.details ?? null;
    throw error;
}

function throwRecordNotSavedError(params={}) {
    const error = new Error( "Record_NotSaved" );
    error.code = "RECORD_NOT_SAVED";
    error.userMessage = params.userMessage ?? null;
    error.details = params.details ?? null;
    throw error;
}

function throwLoginRequiredError(params={}) {
    const error = new Error( "Login_Required" );
    error.code = "LOGIN_REQUIRED";
    error.userMessage = params.userMessage ?? null;
    error.details = params.details ?? null;
    throw error;
}

function throwUpdateFailedError(params={}) {
    const error = new Error( "Update_Failed" );
    error.code = "UPDATE_FAILED";
    error.userMessage = params.userMessage ?? null;
    error.details = params.details ?? null;
    throw error;
}

function throwTransactionFailedError(params={}) {
    const error = new Error( "Transaction_Failed" );
    error.code = "TRANSACTION_FAILED";
    error.userMessage = params.userMessage ?? null;
    error.details = params.details ?? null;
    throw error;
}

function throwUsedTokenError(params={}) {
    const error = new Error( "Used_Token" );
    error.code = "USED_TOKEN";
    error.userMessage = params.userMessage ?? null;
    error.details = params.details ?? null;
    throw error;
}

function throwVisitorTokenError(params={}) {
    const error = new Error( "Bad_Visitor_Token" );
    error.code = "BAD_VISITOR_TOKEN";
    error.userMessage = params.userMessage ?? null;
    error.details = params.details ?? null;
    throw error;
}

function throwFileFormatNotSupportedError(params={}) {
    const error = new Error( "File_Format_Not_Supported" );
    error.code = "FILE_FORMAT_NOT_SUPPORTED";
    error.userMessage = params.userMessage ?? null;
    error.details = params.details ?? null;
    throw error;
}

function throwNotAuthorizedError(params={}) {
    const error = new Error( "Not_Authorized" );
    error.code = "NOT_AUTHORIZED";
    error.userMessage = params.userMessage ?? null;
    error.details = params.details ?? null;
    throw error;
}

function throwBadInputError(params={}) {
    const error = new Error( "Bad_Input" );
    error.code = "BAD_INPUT";
    error.userMessage = params.userMessage ?? null;
    error.details = params.details ?? null;
    throw error;
}

function throwInputNotUuidError(params={}) {
    const error = new Error( "Input_Not_Uuid" );
    error.code = "INPUT_NOT_UUID";
    error.userMessage = params.userMessage ?? null;
    error.details = params.details ?? null;
    throw error;
}

function throwFileTooLargeError(params={}) {
    const error = new Error( "File too large" );
    error.code = "FILE_TOO_LARGE";
    error.userMessage = params.userMessage ?? null;
    error.details = params.details ?? null;
    throw error;
}

function throwInvalidTimeValueError(params={}) {
    const error = new Error( "Invalid time value" );
    error.code = "INVALID_TIME_VALUE";
    error.userMessage = params.userMessage ?? null;
    error.details = params.details ?? null;
    throw error;
}
