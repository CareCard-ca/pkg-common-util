const requestContext = require('./src/middleware/requestContext');
const sendResponse = require('./src/utils/sendResponse');
const createError = require('./src/utils/createError');

module.exports = {
    util: require( './lib/untilityFunctions' ),
    error: require( './lib/appErrorHandlers' ),
    resCode: require( './lib/responseStatus' ),

    // New standardized API response system
    requestContext,
    sendResponse,
    createError
}
