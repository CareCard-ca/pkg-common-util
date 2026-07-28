import * as assert from 'assert';
import { describe, it } from 'mocha';
import {
  createTracePropagationHeaders,
  getActiveTraceMetadata,
  requestContext
} from '../index.mjs';

describe('W3C trace ESM exports', () => {
  it('exports the complete request correlation contract', () => {
    assert.strictEqual(typeof requestContext, 'function');
    assert.strictEqual(typeof createTracePropagationHeaders, 'function');
    assert.strictEqual(typeof getActiveTraceMetadata, 'function');
  });
});
