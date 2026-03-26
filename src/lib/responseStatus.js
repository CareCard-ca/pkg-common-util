/**
 *  The ETag (or entity tag) HTTP response header is an identifier for a specific version of a resource.
 *  It lets caches be more efficient and save bandwidth, as a web server does not need to resend a full
 *  response if the content was not changed. Additionally, etags help to prevent simultaneous updates of
 *  a resource from overwriting each other ("mid-air collisions").
 *
 * If the resource at a given URL changes, a new Etag value must be generated. A comparison of them can
 * determine whether two representations of a resource are the same. Etags are therefore similar to fingerprints, a
 * nd might also be used for tracking purposes by some servers. They might also be set to persist indefinitely
 * by a tracking server.
 *
 *  For example, when editing a wiki, the current wiki content may be hashed and put into an Etag header
 *  in the response:
 *
 * ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
 *
 * When saving changes to a wiki page (posting data), the POST request will contain the If-Match header containing
 * the ETag values to check freshness against.
 *
 * If-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
 *
 * If the hashes don't match, it means that the document has been edited in-between and a 412 Precondition Failed
 * error is thrown.
 *
 * @param res
 * @param ETag
 * @returns {*}
 */
function setOk200( res, ETag ) {

    res.set( { ETag: ETag } );
    res.status( 200 );

    return res;
}

/**
 *    The 201 (Created) status code indicates that the request has been
 *    fulfilled and has resulted in one or more new resources being
 *    created.  The primary resource created by the request is identified
 *    by either a Location header field in the response or, if no Location
 *    field is received, by the effective request URI.
 *
 *    The 201 response payload typically describes and links to the
 *    resource(s) created.  See
 *    https://datatracker.ietf.org/doc/html/rfc7231#section-7.2
 *    for a discussion of the meaning and purpose of validator header
 *    fields, such as ETag and Last-Modified, in a 201 response.
 *
 * @param res
 * @returns {*}
 */
function setCreated201( res ) {
    res.status( 201 );
    return res;
}

/**
 *    The 400 (Bad Request) status code indicates that the server cannot or
 *    will not process the request due to something that is perceived to be
 *    a client error (e.g., malformed request syntax, invalid request
 *    message framing, or deceptive request routing).
 *
 * @param res
 * @returns {*}
 */
function setBadRequest400ClientError( res ) {
    res.status( 400 );
    return res;
}

module.exports = {
    setOk200,
    setCreated201,
    setBadRequest400ClientError
};

