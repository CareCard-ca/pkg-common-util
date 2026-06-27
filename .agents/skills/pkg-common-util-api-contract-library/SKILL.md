---
name: pkg-common-util-api-contract-library
description: 'Use when changing pkg-common-util response shape, error mapping, middleware, request context, status helpers, case conversion, exports, or tests.'
---

# Package Common Util

Non-negotiable TDD rule: Always write the failing test first, run it to confirm it fails for the intended reason, then implement the code and rerun the test until it passes. Test Driven Development is required for all coding work and must not be skipped. For documentation- or skill-only edits, add or update the relevant validation check before changing the prose.

Non-negotiable code organization rule: Functions with the same or equivalent behavior must use the same or clearly corresponding descriptive names across CareCard repositories, and equivalent functionality must live in files with the same names within each repository's established architecture. No backward compatibility names, aliases, or duplicate locations are allowed.

## Purpose

CareCard common utility package for API responses, errors, request context, status helpers, middleware, case conversion, exports, and tests.

## When To Use

- Use when changing pkg-common-util response shape, error mapping, middleware, request context, status helpers, case conversion, exports, or tests.
- Pair with `carecard-workspace-standards` when the task affects shared CareCard conventions or cross-repository contracts.

## When Not To Use

- Do not use for service-local behavior that should remain inside one API or app.
- Do not change package public APIs without updating consumers and compatibility tests.

## Relevant Files And Directories

- package entry files
- `src` when present
- `test`
- `package.json`
- `package-lock.json`
- `.husky`

## Coding Principles

- Preserve the repository structure, naming style, module system, and local helper patterns.
- Prefer readable, maintainable code with meaningful function, variable, file, and test names.
- Avoid new dependencies unless the existing stack cannot reasonably solve the task and the user confirms the tradeoff.
- Keep public exports stable and update CommonJS, ESM, TypeScript declaration, and compatibility surfaces together when present.

## Testing Expectations

- Write or update package tests before behavior or public API changes.
- Include type/export compatibility tests where the package already has them.
- Run package test, lint, type, and Husky validation commands required by the changed area.

## Safety Constraints

- Do not edit generated output, dependency folders, logs, coverage, dist, or build artifacts unless the task requires it.
- Do not revert or overwrite user changes; stage only requested skill or instruction files.
- Never suppress errors, lint failures, type failures, security failures, or failing tests; fix the underlying issue or report the blocker.
- Do not log or expose secrets, JWTs, passwords, credentials, private keys, sensitive personal data, SQL internals, or stack traces.

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
- PostgreSQL RLS failures with SQLSTATE `42501` must map to HTTP 403,
  `NOT_AUTHORIZED`, message `Not permitted to perform the action`, and null
  response details.
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

## Remote Git Operations Guardrail

Do not run remote Git or GitHub operations unless the current user request explicitly asks for them. This includes `git fetch`, `git pull`, `git push`, `git push --delete`, remote branch cleanup, GitHub API calls, and any `gh pr` command that creates, updates, readies, merges, closes, or cleans up a pull request. Do not infer permission from branch names, validation needs, prior workflow habits, or convenience; ask first when remote state would help but was not requested.

## Agent Guidance Git Workflow

When this skill or any repository-owned `.agents` guidance changes, use the
repository's agents-only Git workflow:

1. Work from the affected repository root and confirm only intended `.agents`
   files changed.
2. Use `development` as the base branch when `origin/development` exists;
   otherwise use the repository's default base branch, usually `main`.
3. Create or update `feature/codex` from the updated remote base branch and
   commit all the changed `.agents` guidance files there.
4. Push `feature/codex`, create or reuse a pull request into the base branch,
   and mark the pull request ready for review with `gh pr ready <number>`.
5. Squash-merge with administrator privileges and delete the remote branch:

   ```sh
   gh pr merge <number> --squash --admin --delete-branch
   ```

6. After merge, update the local base branch and remove the local feature
   branch:

   ```sh
   git fetch origin <base> --prune
   git switch <base>
   git pull --ff-only origin <base>
   git branch -d feature/codex
   git ls-remote --heads origin feature/codex
   ```

Do not commit or push `.agents` guidance changes directly from `development`
or `main`. Do not stage unrelated files, generated output, dependency folders,
build artifacts, logs, or `.DS_Store`.
