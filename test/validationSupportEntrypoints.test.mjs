import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'mocha';

import { keysToSnakeCase as keysToSnakeCaseEsm } from '@carecard/common-util/case-converter';
import { throwBadInputError as throwBadInputErrorEsm } from '@carecard/common-util/errors';

const require = createRequire(import.meta.url);
const {
  keysToSnakeCase: keysToSnakeCaseCommonJs,
} = require('@carecard/common-util/case-converter');
const { throwBadInputError: throwBadInputErrorCommonJs } = require('@carecard/common-util/errors');

// Pattern: Public Contract Test - exercises focused package entrypoints through both module systems.
function assertValidationSupportBehavior(keysToSnakeCase, throwBadInputError) {
  assert.deepStrictEqual(keysToSnakeCase({ requestedByEmail: 'person@example.com' }), {
    requested_by_email: 'person@example.com',
  });
  assert.throws(
    () => throwBadInputError({ userMessage: 'Invalid email' }),
    error =>
      error instanceof Error &&
      error.code === 'BAD_INPUT' &&
      error.message === 'Bad_Input' &&
      error.userMessage === 'Invalid email',
  );
}

describe('validation support entrypoints', function () {
  it('provides CommonJS case conversion and bad-input behavior', function () {
    assertValidationSupportBehavior(keysToSnakeCaseCommonJs, throwBadInputErrorCommonJs);
  });

  it('provides ESM case conversion and bad-input behavior', function () {
    assertValidationSupportBehavior(keysToSnakeCaseEsm, throwBadInputErrorEsm);
  });
});
