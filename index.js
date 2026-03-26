const requestContext = require('./src/middleware/requestContext');
const sendResponse = require('./src/utils/sendResponse');
const createError = require('./src/utils/createError');

module.exports = {
    util: require( './src/lib/untilityFunctions' ),
    error: require( './src/lib/appErrorHandlers' ),
    resCode: require( './src/lib/responseStatus' ),

    // New standardized API response system
    requestContext,
    sendResponse,
    createError
}
