const assert = require( 'assert' ).strict;
const { describe, it } = require( 'mocha' );
const { util } = require( '../index' );


describe( 'UtilityFunctions', function () {

    describe( 'Validate function', function () {

        it( 'isValidUuidString; returns true if uuid; false otherwise', function ( done ) {
            const input = { one: "1", two: "2", three: "3", four: "4" }
            const expectedOutput = { one: "1", three: "3" }

            const output = util.extractObjectWithProperties( input, [ "one", "three" ] );

            assert.deepStrictEqual( output, expectedOutput );
            done();
        } );
    } );
} );
