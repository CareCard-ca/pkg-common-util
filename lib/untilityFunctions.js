// Create new object only with properties given in array.
function extractObjectWithProperties( obj, arrayOfProperties ) {
    let returnObj = {};

    arrayOfProperties.forEach( nameOfProperty => {
        if ( obj?.[ nameOfProperty ] ) {
            returnObj[ nameOfProperty ] = obj?.[ nameOfProperty ];
        }
    } );

    return returnObj;
}



module.exports = {
    extractObjectWithProperties
};
