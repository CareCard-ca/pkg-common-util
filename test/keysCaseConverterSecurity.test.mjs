import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { keysToSnakeCase, keysToCamelCase } from '@carecard/common-util';
import { keysToSnakeCase as browserSnakeCase } from '@carecard/common-util/case-converter';

const require = createRequire(import.meta.url);
const commonJs = require('@carecard/common-util');
const browserCommonJs = require('@carecard/common-util/case-converter');

describe('Case conversion preserves untrusted JSON as inert data', () => {
  for (const [entrypoint, convert] of [
    ['ESM', keysToSnakeCase],
    ['CommonJS', commonJs.keysToSnakeCase],
    ['browser ESM', browserSnakeCase],
    ['browser CommonJS', browserCommonJs.keysToSnakeCase],
  ]) {
    it(`${entrypoint} preserves reserved keys without granting inherited properties`, () => {
      const input = JSON.parse(
        '{"metadata":{"__proto__":{"unexpectedAuthority":"inherited"},"constructor":{"prototype":{"admin":true}},"note":"Example"}}',
      );
      const output = convert(input);
      assert.equal(output.metadata.unexpected_authority, undefined);
      assert.equal(output.metadata.admin, undefined);
      assert.deepEqual(
        JSON.parse(JSON.stringify(output)),
        JSON.parse(
          '{"metadata":{"__proto__":{"unexpected_authority":"inherited"},"constructor":{"prototype":{"admin":true}},"note":"Example"}}',
        ),
      );
      assert.equal(input.metadata.unexpectedAuthority, undefined);
    });
  }

  for (const convert of [keysToCamelCase, commonJs.keysToCamelCase]) {
    it('keeps nested reserved-looking metadata and ordinary conversion results', () => {
      const input = JSON.parse(
        '{"record_name":"Example","rows":[{"__proto__":{"display_name":"Data"},"constructor":{"prototype":{"is_admin":true}}}]}',
      );
      const output = convert(input);
      assert.equal(output.rows[0].displayName, undefined);
      assert.equal(output.rows[0].isAdmin, undefined);
      assert.deepEqual(
        JSON.parse(JSON.stringify(output)),
        JSON.parse(
          '{"recordName":"Example","rows":[{"_Proto__":{"displayName":"Data"},"constructor":{"prototype":{"isAdmin":true}}}]}',
        ),
      );
    });
  }
});
