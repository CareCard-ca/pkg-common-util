import * as assert from 'assert';
import { describe, it } from 'mocha';
import {
  createApplicationLogger,
  createHttpRequestLogger,
  installFatalProcessLogging
} from '../logging.mjs';

describe('application logging ESM exports', () => {
  it('exports the complete logging contract', () => {
    assert.strictEqual(typeof createApplicationLogger, 'function');
    assert.strictEqual(typeof createHttpRequestLogger, 'function');
    assert.strictEqual(typeof installFatalProcessLogging, 'function');
  });
});
