---
name: pkg-common-util
description: Use when changing pkg-common-util, the @carecard/common-util shared response, error, request context, status helper, middleware, and case-conversion package. Covers CommonJS and ESM exports, TypeScript declarations, standard API response shape, safe error mapping, request/trace metadata, deprecated compatibility exports, Mocha tests, and type tests.
---

# Package Common Util

## Overview

Use this skill when working inside `pkg-common-util`, the `@carecard/common-util`
package. It defines shared CareCard response, error, request context, middleware,
status helper, and case-conversion behavior used by APIs and frontend services.

Use `$carecard-workspace-standards` for shared workspace, dependency, package,
testing, and security rules. Legacy `pkg-common-util/.codex` guidance has been
migrated into these skills; do not depend on that folder being present.

## Non-Negotiable Rules

- Never use TypeScript type `any`. Use precise exported interfaces, generics,
  `Record<string, unknown>`, or `unknown` with explicit narrowing.
- Follow the existing CommonJS plus ESM wrapper style, Mocha tests, TypeScript
  declaration tests, and CareCard package conventions.
- Follow existing naming conventions for direct exports, deprecated
  compatibility objects, error helpers, response helpers, and middleware.
- Keep source code in `src`, public CommonJS exports in `index.js`, ESM exports
  in `index.mjs`, type declarations in `index.d.ts`, and tests in `test`.
- Use Test-Driven Development. Add or update Mocha and type tests before
  changing behavior or the exported API.
- Never suppress errors, type errors, linter warnings, response-contract
  regressions, or failing tests. Fix the cause.
- Do not add dependencies unless absolutely required. Ask for confirmation first
  with the reason and tradeoff.
- Before finalizing work, run every direct script in `.husky`. Do not bypass
  Husky.

## Package Scope

- `src/utils/sendResponse.js` owns the standard response shape.
- `src/utils/createError.js`, `src/lib/errorUtils.js`,
  `src/lib/errorConstants.js`, and `src/lib/appErrorHandlers.js` own safe error
  creation, throwing, not-found handling, and app error handling.
- `src/middleware/requestContext.js` owns `requestId`, `traceId`, and client
  context propagation.
- `src/lib/keysCaseConverter.js` owns camelCase and snake_case conversion.
- `index.js` is the CommonJS public export surface.
- `index.mjs` is the ESM public export surface.
- `index.d.ts` and `src/types/response.types.ts` must stay aligned with runtime
  exports and response shapes.
- Keep deprecated export objects available unless the user explicitly requests a
  breaking change. Prefer direct exports in new examples and callers.

## Response And Error Contract

- Preserve dashboard-facing response fields: `success`, `status`, `statusCode`,
  `code`, `message`, `data`, `error`, `details`, and `meta`.
- Preserve request metadata fields such as `version`, `service`, `environment`,
  `timestamp`, `requestId`, `traceId`, `client`, and pagination.
- Error responses must be safe for users and useful for callers.
- Do not expose stack traces, SQL, secrets, tokens, credentials, private keys, or
  sensitive personal data in error responses.
- Keep validation, authentication, authorization, not-found, conflict, bad
  input, file, network, and unexpected errors mapped to stable
  machine-readable codes.
- Do not change existing error code strings or response shape without updating
  all tests and downstream consumers.
- Include request and correlation context where the package already supports
  it.

## Types And Exports

- Keep `index.d.ts` synchronized with `index.js`, `index.mjs`, and `src`.
- Use `unknown` for untrusted error details and narrow before reading fields.
- Keep `src/types/response.types.ts` aligned with the public declarations.
- When adding a direct export, add the matching CommonJS export, ESM named
  export, type declaration, README note, and tests.
- Preserve deprecated compatibility objects while adding or promoting direct
  exports.

## Middleware And Case Conversion

- Keep `requestContext` middleware compatible with Express request/response
  behavior and trace headers.
- Preserve request ID and trace propagation semantics.
- Keep case conversion behavior predictable for nested objects, arrays, nulls,
  primitives, and already-converted keys.
- Add focused tests before changing conversion edge cases.

## Tests

- Use Mocha for runtime behavior under `test`.
- Use `test/types.test.mts` for type coverage.
- Cover response creation, error helper behavior, app error middleware, request
  context propagation, trace header behavior, status helpers, and case
  conversion when those paths change.
- Cover CommonJS, ESM, and declaration surfaces when adding or changing public
  exports.
- Keep tests deterministic and avoid external services.

## Validation

Useful commands:

- `npm run lint`
- `npm run lint:fix`
- `npm run format`
- `npm run format:check`
- `npm run test`
- `npm run test:types`
- `npm run test:coverage`
- `npm run test:All`

Before pushing or finalizing, run every direct `.husky` script. The current
`.husky/pre-commit` runs:

```bash
npm run lint:fix
npm run format
npm run test:All
```

If any validation command cannot run, report the exact command, failure reason,
and remaining risk.
