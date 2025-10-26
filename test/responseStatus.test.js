const assert = require( 'assert' ).strict;
const { describe, it, afterEach } = require( 'mocha' );
const { resCode } = require( '../index' );


describe( 'ResponseStatus', function () {


    const res = {
        statusCode: null,
        header: null,
        status( code ) {
            this.statusCode = code;
        },
        set( obj ) {
            this.header = obj;
        }
    }

    afterEach( () => res.statusCode = null );

    it( 'setOk200', function ( done ) {

        const ETag = "33a64df551425fcc55e4d42a148795d9f25f89d4";

        const modifiedResObj = resCode.setOk200( res, ETag );

        assert.deepStrictEqual( res.statusCode, 200 );
        assert.deepStrictEqual( modifiedResObj.statusCode, 200 );
        assert.deepStrictEqual( modifiedResObj.header[ 'ETag' ], ETag );
        done();
    } );

    it( 'setCreated201', function ( done ) {

        const modifiedResObj = resCode.setCreated201( res );

        assert.deepStrictEqual( res.statusCode, 201 );
        assert.deepStrictEqual( modifiedResObj.statusCode, 201 );
        done();
    } );

    it( 'setBadRequest400ClientError', function ( done ) {

        const modifiedResObj = resCode.setBadRequest400ClientError( res );

        assert.deepStrictEqual( res.statusCode, 400 );
        assert.deepStrictEqual( modifiedResObj.statusCode, 400 );
        done();
    } );

} );
