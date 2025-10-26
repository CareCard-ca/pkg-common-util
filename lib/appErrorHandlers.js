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
    res.send( { error: "not_found" } )
}

function appErrorHandler( err, req, res, next ) {
    switch ( err?.message ) {

        case "Validation_Failure":
            res.status( 401 );
            res.send( { error: "validation_failure" } )
            break;

        case "Used_Token":
        case "Wrong_Credentials":
            res.status( 401 );
            res.send( { error: "wrong_credentials" } )
            break;

        case "Bad_Visitor_Token":
            res.status( 401 );
            res.send( { error: "bad_visitor_token" } )
            break;

        case "Record_NotSaved":
            res.status( 400 );
            res.send( { error: "record_save_failure" } )
            break;

        case "Record_Exist":
            res.status( 409 );
            res.send( { error: "record_exist" } )
            break;

        case "Record_NotFound":
            res.status( 404 );
            res.send( { error: "record_not_found" } )
            break;

        case "Update_Failed":
            res.status( 400 );
            res.send( { error: "update_failed" } )
            break;

        case "Login_Required":
            res.status( 401 );
            res.send( { error: "login_required" } )
            break;

        case "Transaction_Failed":
            res.status( 400 );
            res.send( { error: "transaction_failed" } )
            break;

        case "File_Format_Not_Supported":
            res.status( 415 );
            res.send( { error: "file_format_not_supported" } )
            break;

        case "Not_Authorized":
            res.status( 401 );
            res.send( { error: "not_authorized" } )
            break;

        case "Bad_Input":
            res.status( 400 );
            res.send( { error: "bad_input" } )
            break;

        case  "Input_Not_Uuid" :
            res.status( 400 );
            res.send( { error: "input_not_uuid" } )
            break;

        case "File too large":
            res.status( 413 );
            res.send( { error: "file_too_large" } )
            break;

        case "Invalid time value":
            res.status( 403 );
            res.send( { error: "invalid_time_value" } )
            break;

        default:
            res.status( 500 );
            res.send( { error: "application_error" } )
    }
}


function throwValidationFailureError() {
    throw new Error( "Validation_Failure" );
}

function throwWrongCredentialsError() {
    throw new Error( "Wrong_Credentials" );
}

function throwRecordExistError() {
    throw new Error( "Record_Exist" );
}

function throwRecordNotFoundError() {
    throw new Error( "Record_NotFound" );
}

function throwRecordNotSavedError() {
    throw new Error( "Record_NotSaved" );
}

function throwLoginRequiredError() {
    throw new Error( "Login_Required" );
}

function throwUpdateFailedError() {
    throw new Error( "Update_Failed" );
}

function throwTransactionFailedError() {
    throw new Error( "Transaction_Failed" );
}

function throwUsedTokenError() {
    throw new Error( "Used_Token" );
}

function throwVisitorTokenError() {
    throw new Error( "Bad_Visitor_Token" );
}

function throwFileFormatNotSupportedError() {
    throw new Error( "File_Format_Not_Supported" );
}

function throwNotAuthorizedError() {
    throw new Error( "Not_Authorized" );
}

function throwBadInputError() {
    throw new Error( "Bad_Input" );
}

function throwInputNotUuidError() {
    throw new Error( "Input_Not_Uuid" );
}

function throwFileTooLargeError() {
    throw new Error( "File too large" );
}

function throwInvalidTimeValueError() {
    throw new Error( "Invalid time value" );
}
