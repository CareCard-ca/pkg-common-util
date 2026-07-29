'use strict';

const assert = require('assert').strict;
const { context, TraceFlags, trace } = require('@opentelemetry/api');
const { AsyncLocalStorageContextManager } = require('@opentelemetry/context-async-hooks');
const { after, before, describe, it } = require('mocha');

const {
  createTracePropagationHeaders,
  getActiveTraceMetadata,
  requestContext
} = require('../index');

const activeSpanContext = {
  isRemote: false,
  spanId: '00f067aa0ba902b7',
  traceFlags: TraceFlags.SAMPLED,
  traceId: '4bf92f3577b34da6a3ce929d0e0e4736'
};

describe('OpenTelemetry trace context bridge', function () {
  let contextManager;

  // Pattern: Test Fixture - installs the SDK context manager used by this suite.
  before(function () {
    contextManager = new AsyncLocalStorageContextManager().enable();
    assert.equal(context.setGlobalContextManager(contextManager), true);
  });

  // Pattern: Test Fixture - releases the global SDK context manager owned by this suite.
  after(function () {
    context.disable();
    contextManager.disable();
  });

  it('uses the active OpenTelemetry server span for request and log correlation', function (done) {
    const activeContext = trace.setSpan(context.active(), trace.wrapSpanContext(activeSpanContext));
    const responseHeaders = {};
    const request = createRequest();

    context.with(activeContext, () => {
      requestContext(request, createResponse(responseHeaders), () => {
        assert.deepEqual(getActiveTraceMetadata(), {
          spanId: activeSpanContext.spanId,
          traceFlags: '01',
          traceId: activeSpanContext.traceId
        });
        assert.deepEqual(createTracePropagationHeaders(), {
          traceparent: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01'
        });
        assert.equal(request.traceId, activeSpanContext.traceId);
        assert.equal(request.spanId, activeSpanContext.spanId);
        assert.equal(responseHeaders.traceparent, createTracePropagationHeaders().traceparent);
        done();
      });
    });
  });
});

// Pattern: Test Data Builder - creates an inbound request with a competing parent context.
function createRequest() {
  return {
    headers: {
      traceparent: '00-7bf92f3577b34da6a3ce929d0e0e4739-10f067aa0ba902b8-00'
    },
    ip: '127.0.0.1',
    socket: {}
  };
}

// Pattern: Test Spy - records the response correlation header without an HTTP server.
function createResponse(responseHeaders) {
  return {
    setHeader(name, value) {
      responseHeaders[name] = value;
    }
  };
}
