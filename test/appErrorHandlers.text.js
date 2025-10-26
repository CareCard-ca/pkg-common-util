const { describe, it } = require( "mocha" );
const request = require( 'supertest' );
const assert = require( 'assert' );
const express = require( 'express' );
const errHandler = require( '../lib/appErrorHandlers' );

function testApp( throwErrorFunction ) {
    const app = express();

    app.use( ( req, res, next ) => {
        throwErrorFunction();
    } );

    app.use( errHandler.appErrorHandler );
    return app;
}

describe( "AppErrorHandlers", function () {


    it( "throwValidationFailureError", function ( done ) {

        // Act
        request( testApp( errHandler.throwValidationFailureError ) )
            .get( '/' )
            .expect( 401 )
            .end( ( err, response ) => {
                if ( err ) return;

                // Assert
                assert.deepStrictEqual( response?.body?.error, "validation_failure" );
                done();
            } );
    } );

    it( "throwRecordExistError", function ( done ) {

        // Act
        request( testApp( errHandler.throwRecordExistError ) )
            .get( '/' )
            .expect( 409 )
            .end( ( err, response ) => {
                if ( err ) return;

                // Assert
                assert.deepStrictEqual( response?.body?.error, "record_exist" );
                done();
            } );
    } );

    it( "throwWrongCredentialsError", function ( done ) {

        // Act
        request( testApp( errHandler.throwWrongCredentialsError ) )
            .get( '/' )
            .expect( 401 )
            .end( ( err, response ) => {
                if ( err ) return;

                // Assert
                assert.deepStrictEqual( response?.body?.error, "wrong_credentials" );
                done();
            } );
    } );

    it( "throwLoginRequiredError", function ( done ) {

        // Act
        request( testApp( errHandler.throwLoginRequiredError ) )
            .get( '/' )
            .expect( 401 )
            .end( ( err, response ) => {
                if ( err ) return;

                // Assert
                assert.deepStrictEqual( response?.body?.error, "login_required" );
                done();
            } );
    } );

    it( "throwRecordNotFoundError", function ( done ) {

        // Act
        request( testApp( errHandler.throwRecordNotFoundError ) )
            .get( '/' )
            .expect( 404 )
            .end( ( err, response ) => {
                if ( err ) return;

                // Assert
                assert.deepStrictEqual( response?.body?.error, "record_not_found" );
                done();
            } );
    } );

    it( "throwRecordNotSavedError", function ( done ) {

        // Act
        request( testApp( errHandler.throwRecordNotSavedError ) )
            .get( '/' )
            .expect( 400 )
            .end( ( err, response ) => {
                if ( err ) return;

                // Assert
                assert.deepStrictEqual( response?.body?.error, "record_save_failure" );
                done();
            } );
    } );

    it( "throwUpdateFailedError", function ( done ) {

        // Act
        request( testApp( errHandler.throwUpdateFailedError ) )
            .get( '/' )
            .expect( 400 )
            .end( ( err, response ) => {
                if ( err ) return;

                // Assert
                assert.deepStrictEqual( response?.body?.error, "update_failed" );
                done();
            } );
    } );

    it( "throwTransactionFailedError", function ( done ) {

        // Act
        request( testApp( errHandler.throwTransactionFailedError ) )
            .get( '/' )
            .expect( 400 )
            .end( ( err, response ) => {
                if ( err ) return;

                // Assert
                assert.deepStrictEqual( response?.body?.error, "transaction_failed" );
                done();
            } );
    } );

    it( "throwUsedTokenError", function ( done ) {

        // Act
        request( testApp( errHandler.throwUsedTokenError ) )
            .get( '/' )
            .expect( 401 )
            .end( ( err, response ) => {
                if ( err ) return;

                // Assert
                assert.deepStrictEqual( response?.body?.error, "wrong_credentials" );
                done();
            } );
    } );

    it( "throwBadVisitorTokenError", function ( done ) {

        // Act
        request( testApp( errHandler.throwBadVisitorTokenError ) )
            .get( '/' )
            .expect( 401 )
            .end( ( err, response ) => {
                if ( err ) return;

                // Assert
                assert.deepStrictEqual( response?.body?.error, "bad_visitor_token" );
                done();
            } );
    } );

    it( "throwFileFormatNotSupportedError", function ( done ) {

        // Act
        request( testApp( errHandler.throwFileFormatNotSupportedError ) )
            .get( '/' )
            .expect( 415 )
            .end( ( err, response ) => {
                if ( err ) return;

                // Assert
                assert.deepStrictEqual( response?.body?.error, "file_format_not_supported" );
                done();
            } );
    } );

    it( "throwNotAuthorizedError", function ( done ) {

        // Act
        request( testApp( errHandler.throwNotAuthorizedError ) )
            .get( '/' )
            .expect( 401 )
            .end( ( err, response ) => {
                if ( err ) return;

                // Assert
                assert.deepStrictEqual( response?.body?.error, "not_authorized" );
                done();
            } );
    } );

    it( "throwBadInputError", function ( done ) {

        // Act
        request( testApp( errHandler.throwBadInputError ) )
            .get( '/' )
            .expect( 400 )
            .end( ( err, response ) => {
                if ( err ) return;

                // Assert
                assert.deepStrictEqual( response?.body?.error,  "bad_input" );
                done();
            } );
    } );

    it( "throwInputNotUuidError", function ( done ) {

        // Act
        request( testApp( errHandler.throwInputNotUuidError ) )
            .get( '/' )
            .expect( 400 )
            .end( ( err, response ) => {
                if ( err ) return;

                // Assert
                assert.deepStrictEqual( response?.body?.error, "input_not_uuid"  );
                done();
            } );
    } );

    it( "throwFileTooLargeError", function ( done ) {

        // Act
        request( testApp( errHandler.throwFileTooLargeError ) )
            .get( '/' )
            .expect( 413 )
            .end( ( err, response ) => {
                if ( err ) return;

                // Assert
                assert.deepStrictEqual( response?.body?.error, "file_too_large"  );
                done();
            } );
    } );

    it( "throwInvalidTimeValueError", function ( done ) {

        // Act
        request( testApp( errHandler.throwInvalidTimeValueError ) )
            .get( '/' )
            .expect( 403 )
            .end( ( err, response ) => {
                if ( err ) return;

                // Assert
                assert.deepStrictEqual( response?.body?.error, "invalid_time_value"  );
                done();
            } );
    } );
} );
