export function throwBadInputError(params?: { userMessage?: string; details?: unknown }): never;

declare const errors: {
  throwBadInputError: typeof throwBadInputError;
};

export default errors;
