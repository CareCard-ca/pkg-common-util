# Codex Instructions For pkg-common-util

These instructions apply to the `pkg-common-util` repository. Follow the
workspace instructions in
`/Users/pankajpriscilla/SO_CareCardCa/.codex/AGENTS.md` first, then apply the
repository-specific guidance below.

## Non-Negotiable Instructions

- Never use TypeScript type `any`. Use precise exported interfaces, generics,
  `Record<string, unknown>`, or `unknown` with explicit narrowing.
- Always follow the existing CommonJS plus ESM wrapper style, Mocha tests,
  TypeScript declaration tests, and CareCard package conventions.
- Always follow existing naming conventions for direct exports, deprecated
  compatibility objects, error helpers, response helpers, and middleware.
- Always follow the existing project structure. Keep source code in `src`,
  public CommonJS exports in `index.js`, ESM exports in `index.mjs`, type
  declarations in `index.d.ts`, and tests in `test`.
- Always use Test-Driven Development. Add or update Mocha and type tests before
  changing behavior or the exported API.
- Never suppress errors, type errors, linter warnings, response-contract
  regressions, or failing tests. Fix the cause.
- Do not add dependencies unless they are absolutely required. Ask for
  confirmation first with the reason and tradeoff.
- Before finalizing work, run every direct script in `.husky`. Do not bypass
  Husky.

## Package Scope

- This package defines the shared CareCard response, error, request context, and
  case-conversion behavior used by APIs and frontend services.
- `src/utils/sendResponse.js` owns the standard response shape.
- `src/utils/createError.js`, `src/lib/errorUtils.js`,
  `src/lib/errorConstants.js`, and `src/lib/appErrorHandlers.js` own safe error
  creation, throwing, not-found handling, and app error handling.
- `src/middleware/requestContext.js` owns `requestId`, `traceId`, and client
  context propagation.
- `src/lib/keysCaseConverter.js` owns camelCase and snake_case conversion.
- Keep deprecated export objects available unless the user explicitly requests a
  breaking change. Prefer direct exports in new examples and callers.

## Response And Error Contract

- Preserve dashboard-facing response fields: `success`, `status`,
  `statusCode`, `code`, `message`, `data`, `error`, `details`, and `meta`.
- Preserve request metadata fields such as `version`, `service`,
  `environment`, `timestamp`, `requestId`, `traceId`, `client`, and pagination.
- Error responses must be safe for users and useful for callers. Do not expose
  stack traces, SQL, secrets, tokens, credentials, private keys, or sensitive
  personal data.
- Keep validation, authentication, authorization, not-found, conflict, bad
  input, file, network, and unexpected errors mapped to stable machine-readable
  codes.
- Do not change existing error code strings or response shape without updating
  all tests and downstream consumers.

## Types And Exports

- Keep `index.d.ts` synchronized with `index.js`, `index.mjs`, and `src`.
- Use `unknown` for untrusted error details and narrow before reading fields.
- Keep `src/types/response.types.ts` aligned with the public declarations.
- When adding a direct export, add the matching CommonJS export, ESM named
  export, type declaration, README note, and tests.

## Testing And Validation

- Use Mocha for runtime behavior and `test/types.test.mts` for type coverage.
- Cover response creation, error helper behavior, app error middleware, request
  context propagation, trace header behavior, status helpers, and case
  conversion when those paths change.
- `.husky/pre-commit` currently runs `npm run lint:fix`, `npm run format`, and
  `npm run test:All`.
