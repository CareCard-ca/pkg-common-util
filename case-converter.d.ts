export function keysToCamelCase<T>(input: T): T;
export function keysToSnakeCase<T>(input: T): T;

declare const caseConverter: {
  keysToCamelCase: typeof keysToCamelCase;
  keysToSnakeCase: typeof keysToSnakeCase;
};

export default caseConverter;
