'use strict';

const assert = require('assert').strict;
const { describe, it } = require('mocha');
const {
  createTracePropagationHeaders,
  getActiveTraceMetadata,
  requestContext
} = require('../index');

const firstTraceparent = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';
const secondTraceparent = '00-7bf92f3577b34da6a3ce929d0e0e4739-10f067aa0ba902b8-00';
const propagationHeadersOutsideRequest = createTracePropagationHeaders();
const metadataOutsideRequest = getActiveTraceMetadata();

describe('W3C trace context', function () {
  it('returns no propagation headers outside an active request', function () {
    assert.deepStrictEqual(propagationHeadersOutsideRequest, {});
    assert.deepStrictEqual(metadataOutsideRequest, {});
  });

  it('propagates the active service span as the downstream parent', function (done) {
    const req = createRequest(firstTraceparent);

    requestContext(req, createResponse(), () => {
      assert.deepStrictEqual(createTracePropagationHeaders(), {
        traceparent: `00-${req.traceId}-${req.spanId}-01`
      });
      done();
    });
  });

  it('keeps concurrent asynchronous request contexts isolated', async function () {
    const [firstMetadata, secondMetadata] = await Promise.all([
      readMetadataAfterAsyncBoundary(firstTraceparent),
      readMetadataAfterAsyncBoundary(secondTraceparent)
    ]);

    assert.strictEqual(firstMetadata.traceId, '4bf92f3577b34da6a3ce929d0e0e4736');
    assert.strictEqual(firstMetadata.traceFlags, '01');
    assert.strictEqual(secondMetadata.traceId, '7bf92f3577b34da6a3ce929d0e0e4739');
    assert.strictEqual(secondMetadata.traceFlags, '00');
    assert.notStrictEqual(firstMetadata.spanId, secondMetadata.spanId);
  });

  for (const invalidTraceparent of [
    '00-00000000000000000000000000000000-00f067aa0ba902b7-01',
    '00-4bf92f3577b34da6a3ce929d0e0e4736-0000000000000000-01',
    'ff-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01',
    'not-a-traceparent'
  ]) {
    it(`starts a new trace for invalid traceparent ${invalidTraceparent}`, function (done) {
      const req = createRequest(invalidTraceparent);

      requestContext(req, createResponse(), () => {
        assert.match(req.traceId, /^[0-9a-f]{32}$/);
        assert.notStrictEqual(req.traceId, '4bf92f3577b34da6a3ce929d0e0e4736');
        assert.strictEqual(req.parentSpanId, undefined);
        done();
      });
    });
  }
});

function createRequest(traceparent) {
  return {
    headers: { traceparent },
    ip: '127.0.0.1',
    socket: {}
  };
}

function createResponse() {
  return {
    setHeader() {}
  };
}

function readMetadataAfterAsyncBoundary(traceparent) {
  return new Promise((resolve, reject) => {
    requestContext(createRequest(traceparent), createResponse(), () => {
      setImmediate(() => {
        try {
          resolve(getActiveTraceMetadata());
        } catch (error) {
          reject(error);
        }
      });
    });
  });
}
