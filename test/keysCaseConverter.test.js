'use strict';

const assert = require('assert');
const { keysToCamelCase, keysToSnakeCase } = require('../index');

describe('keysCaseConverter', () => {
  describe('keysToCamelCase', () => {
    it('should convert simple object keys to camelCase', () => {
      const input = {
        first_name: 'John',
        last_name: 'Doe',
        'middle-name': 'Quincy',
        Age: 30
      };
      const expected = {
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Quincy',
        age: 30
      };
      assert.deepStrictEqual(keysToCamelCase(input), expected);
    });

    it('should convert nested object keys to camelCase', () => {
      const input = {
        user_info: {
          first_name: 'John',
          contact_details: {
            phone_number: '1234567890'
          }
        }
      };
      const expected = {
        userInfo: {
          firstName: 'John',
          contactDetails: {
            phoneNumber: '1234567890'
          }
        }
      };
      assert.deepStrictEqual(keysToCamelCase(input), expected);
    });

    it('should convert array of objects keys to camelCase', () => {
      const input = [{ first_name: 'John' }, { last_name: 'Doe' }];
      const expected = [{ firstName: 'John' }, { lastName: 'Doe' }];
      assert.deepStrictEqual(keysToCamelCase(input), expected);
    });

    it('should handle nested arrays and objects', () => {
      const input = {
        user_list: [
          {
            first_name: 'John',
            tags: ['tag_1', 'tag_2'],
            meta_data: {
              last_login: '2023-01-01'
            }
          }
        ]
      };
      const expected = {
        userList: [
          {
            firstName: 'John',
            tags: ['tag_1', 'tag_2'],
            metaData: {
              lastLogin: '2023-01-01'
            }
          }
        ]
      };
      assert.deepStrictEqual(keysToCamelCase(input), expected);
    });

    it('should not change Date objects', () => {
      const date = new Date();
      const input = { created_at: date };
      const result = keysToCamelCase(input);
      assert.strictEqual(result.createdAt instanceof Date, true);
      assert.strictEqual(result.createdAt.getTime(), date.getTime());
    });

    it('should handle null and primitives', () => {
      assert.strictEqual(keysToCamelCase(null), null);
      assert.strictEqual(keysToCamelCase(123), 123);
      assert.strictEqual(keysToCamelCase('string'), 'string');
    });

    it('should handle non-string keys gracefully (though Object.entries converts them)', () => {
      const input = { 1: 'one', 2: 'two' };
      const expected = { 1: 'one', 2: 'two' };
      assert.deepStrictEqual(keysToCamelCase(input), expected);
    });
  });

  describe('keysToSnakeCase', () => {
    it('should convert simple object keys to snake_case', () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        'middle-name': 'Quincy',
        Age: 30
      };
      const expected = {
        first_name: 'John',
        last_name: 'Doe',
        middle_name: 'Quincy',
        age: 30
      };
      assert.deepStrictEqual(keysToSnakeCase(input), expected);
    });

    it('should convert nested object keys to snake_case', () => {
      const input = {
        userInfo: {
          firstName: 'John',
          contactDetails: {
            phoneNumber: '1234567890'
          }
        }
      };
      const expected = {
        user_info: {
          first_name: 'John',
          contact_details: {
            phone_number: '1234567890'
          }
        }
      };
      assert.deepStrictEqual(keysToSnakeCase(input), expected);
    });

    it('should handle acronyms and mixed cases', () => {
      const input = {
        XMLHttpRequest: 'test',
        ABCKey: 'val',
        'Some-Other_Key': 'foo'
      };
      const result = keysToSnakeCase(input);
      // Based on implementation:
      // XMLHttpRequest -> xml_http_request
      // ABCKey -> abc_key
      // Some-Other_Key -> some_other_key
      assert.strictEqual(result.xml_http_request, 'test');
      assert.strictEqual(result.abc_key, 'val');
      assert.strictEqual(result.some_other_key, 'foo');
    });

    it('should convert array of objects keys to snake_case', () => {
      const input = [{ firstName: 'John' }, { lastName: 'Doe' }];
      const expected = [{ first_name: 'John' }, { last_name: 'Doe' }];
      assert.deepStrictEqual(keysToSnakeCase(input), expected);
    });

    it('should not change Date objects', () => {
      const date = new Date();
      const input = { createdAt: date };
      const result = keysToSnakeCase(input);
      assert.strictEqual(result.created_at instanceof Date, true);
      assert.strictEqual(result.created_at.getTime(), date.getTime());
    });
  });
});
