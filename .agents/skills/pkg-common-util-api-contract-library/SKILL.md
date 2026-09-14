---
name: pkg-common-util-api-contract-library
description: 'Use when changing pkg-common-util response shape, error mapping, middleware, request context, status helpers, case conversion, exports, or tests.'
---

Non-negotiable root-cause solution rule: Always identify and solve the verified root cause, use the stronger solution, and deliver a correct, durable, production-quality result. Never treat a temporary workaround, resource increase, retry, suppression, bypass, or symptom-only patch as completion. Validate the root-cause fix against the real failing workflow and prove the end state.

# Package Common Util

Non-negotiable TDD rule: Always write the failing test first, run it to confirm it fails for the intended reason, then implement the code and rerun the test until it passes. Test Driven Development is required for all coding work and must not be skipped. For documentation- or skill-only edits, run the relevant focused non-test
validation before changing the prose; do not add automated tests that inspect
prose, files, or repository structure.

Non-negotiable repository isolation rule: Every repository must run its Husky hooks and tests using only files, code, fixtures, dependencies, and services contained within that repository. Tests and Husky scripts must not import, require, read, execute, or otherwise depend on sibling repositories or paths outside the repository root. app-e2e-tests is the only exception because cross-repository end-to-end testing is its explicit responsibility.

Non-negotiable error and warning rule: Never suppress, silence, hide, downgrade, filter, ignore, skip, or bypass errors or warnings from code, tests, tools, compilers, linters, or validation. Fix the root cause, then rerun the affected check and require a clean result. Expected error-path tests may assert errors, but must not conceal unexpected failures.

Non-negotiable TypeScript type rule: Never use the TypeScript type `any`; always use specific domain types, generics, existing project types, or `unknown` with explicit narrowing in all TypeScript-family files (`.ts`, `.tsx`, `.mts`, `.cts`, and `.d.ts`).

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

- Write a new failing consumer-facing test through the supported package root
  before behavior or public API changes. Modify a pre-existing test only after
  the user grants fresh, explicit permission for that exact change.
- Include consumer-facing runtime and compilation tests through the supported package root. Exercise public behavior and realistic type usage without inspecting export objects, source files, or module layout.
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
- Use Test-Driven Development. Add a new failing consumer-facing Mocha or type
  test through the supported package root before changing behavior or the
  exported API. Modify a pre-existing test only after the user grants fresh,
  explicit permission for that exact change.
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
- `case-converter.*` and `errors.*` are focused browser-safe entrypoints for
  consumers that must not load server-only request context or trace storage.
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
- When adding a public capability, keep CommonJS, ESM, type declarations, and
  documentation aligned. Functional tests must exercise its behavior through
  each supported package root; they must not assert export existence or inspect
  module source.
- Keep focused browser-safe entrypoints free of Node-only tracing, logging,
  filesystem, and request-context dependencies.
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
- Compile realistic consumer code through the supported package root for externally visible type behavior.
- Cover response creation, error helper behavior, app error middleware, request
  context propagation, trace header behavior, status helpers, and case
  conversion when those paths change.
- Exercise the same public behavior through supported CommonJS and ESM package
  roots, and compile realistic consumer type usage. Do not inspect export
  objects or declaration/source structure.
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

Fetches needed to establish a fresh `origin/main` at task start and before a
source-branch push are authorized without a separate approval question. Commits,
pushes, PR mutations, and branch cleanup require an authorized task; a request
for local work alone does not authorize publication. An authorized squash merge
into `main` includes the merged-source cleanup, local `main` update, and
`development` synchronization below unless the user explicitly says otherwise.
Never delete local or remote `main`, or force-push to remote `main`, including
with `--force-with-lease`.

## Agent Guidance Git Workflow

Reuse the current working branch for every follow-up request, even when the
subject changes or the working tree is clean. Create a branch only when no
working branch exists or the checkout is on `main` or `development`. Otherwise,
fetch remote `main` HEAD and rebase the same working branch onto that fetched
commit, preserving its commits and uncommitted work.

Work from the owning repository root and stage only intended guidance changes.
Fetch fresh `origin/main` at task start. Create `<agent-name>/<branch-name>`
from it only when no working branch exists or the current branch is `main` or
`development`. Otherwise keep
and rebase the current branch onto it, preserving existing commits and
uncommitted changes. Build subsequent task commits on that same branch, even
for a different task or a clean working tree. Honor explicit user
working-branch instructions.

Fetch again before every source-branch push and rebase only when the branch
does not already contain the latest `origin/main`. Required fetches need no
separate approval; commits, pushes, PR mutations, and cleanup require an
authorized task. A local guidance edit does not authorize publishing it.

For an authorized merge, create or reuse the PR into `main`, run applicable
validation, and squash-merge; administrator privileges may be used without
GitHub reviews. Verify the merge and delete its source branch remotely and
locally after checking for newer unmerged work. Then fast-forward local `main`
and replace local and remote branches named exactly `development` with the
latest remote `main` commit, using an explicit observed-commit
`--force-with-lease` remotely. Create a missing development counterpart when
either existed; leave repositories with neither unchanged. If development was
the merged source, recreate it from the new main. Verify commit parity and
cleanup; preserve dirty worktrees and report conflicts or rejected leases.

Never delete local or remote `main` or force-push to remote `main`, including
with `--force-with-lease`. Guard exact destination refs before deleting or
forcing any branch. Do not amend commits or stage unrelated files.

## Fail-Closed Test Lifecycle Audit

The current package tests own no HTTP listener, database pool, Kafka client,
background timer, or child process after completion. Mocha's test timeout fails
a stalled async test, the suites run without bail or forced exit, and npm
preserves each command's nonzero status. Keep natural process exit as the open
handle regression check; validation must not hide failures with retries, forced
success, skipped tests, or output suppression.

Do not add unpublished executable validation code to a `pkg-*` repository. If a
future test owns a long-lived resource or demonstrates a post-suite hang, add a
contract-tested process watchdog through the coordinated package version,
publish, and consumer propagation workflow. That watchdog must return
immediately when no helper remains, allow only a bounded 250 ms settlement
window for already-stopping helpers, fail persistent descendants, preserve
failures and output, use exit code `124` only for a real outer deadline, and
remain a final guard rather than a substitute for explicit cleanup.

## TDD And Validation

Test Driven Development is a non-negotiable requirement.

The sole purpose of automated tests is to verify observable functionality and externally visible behavior.
Tests must validate what the system does through its public interfaces and expected outcomes.

Tests must not assert, inspect, or depend on implementation details, including but not limited to:

- The existence of specific lines of code, statements, functions, classes, files, or modules.
- Specific algorithms, control flow, variable names, method calls, code snippets, or internal implementation choices.
- Any internal structure that can change without changing externally observable behavior.

A correct implementation may be completely rewritten or refactored without requiring changes to functional tests, provided its externally observable behavior remains unchanged.

Any test that fails solely because the implementation changed while the externally observable behavior remained correct is incorrectly designed and must be rewritten or removed.

This requirement is mandatory for all new tests and must be applied whenever existing tests are modified.
