import * as assert from 'assert';
import { describe, it } from 'mocha';
import {
  createTracePropagationHeaders,
  getActiveTraceMetadata,
  requestContext
} from '../index.mjs';

describe('W3C trace ESM exports', () => {
  it('continues request correlation through the ESM package boundary', () => {
    const responseHeaders = {};
    const request = {
      headers: {
        traceparent: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01'
      },
      socket: { remoteAddress: '127.0.0.1' }
    };
    let activeMetadata;

    requestContext(request, { setHeader: (name, value) => (responseHeaders[name] = value) }, () => {
      activeMetadata = getActiveTraceMetadata();
      assert.deepStrictEqual(createTracePropagationHeaders(), {
        traceparent: `00-${request.traceId}-${request.spanId}-01`
      });
    });

    assert.strictEqual(request.traceId, '4bf92f3577b34da6a3ce929d0e0e4736');
    assert.strictEqual(activeMetadata.traceId, request.traceId);
    assert.strictEqual(responseHeaders.traceparent, `00-${request.traceId}-${request.spanId}-01`);
  });
});
