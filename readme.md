# @carecard/common-util

Non-negotiable test order invariance rule: Every test must pass independently of which tests run before or after it, and the suite must pass in every execution order. Each test must establish the state it needs, isolate mutable state, and clean up state it owns; it must never rely on another test's setup, mutations, or cleanup. Default test, CI, and Husky commands must use the test framework's ordinary ordering and must not force randomized ordering. Random-order execution is an explicit diagnostic only, and every failure it exposes must be fixed at the root cause.

Non-negotiable root-cause solution rule: Always identify and solve the verified root cause, use the stronger solution, and deliver a correct, durable, production-quality result. Never treat a temporary workaround, resource increase, retry, suppression, bypass, or symptom-only patch as completion. Validate the root-cause fix against the real failing workflow and prove the end state.

Standardized API response system, request context middleware, and utility functions for Express.js and Next.js microservices.

## Runtime requirement

Use Node.js 24.20.0. The package accepts compatible Node.js releases from
24.20.0 up to, but not including, Node.js 25.

## Development Rule

Non-negotiable TDD rule: Always write the failing test first, run it to confirm it fails for the intended reason, then implement the code and rerun the test until it passes. Test Driven Development is required for all coding work and must not be skipped. For documentation- or skill-only edits, run the relevant focused non-test
validation before changing the prose; do not add automated tests that inspect
prose, files, or repository structure.

Non-negotiable repository isolation rule: Every repository must run its Husky hooks and tests using only files, code, fixtures, dependencies, and services contained within that repository. Tests and Husky scripts must not import, require, read, execute, or otherwise depend on sibling repositories or paths outside the repository root. app-e2e-tests is the only exception because cross-repository end-to-end testing is its explicit responsibility.

Non-negotiable error and warning rule: Never suppress, silence, hide, downgrade, filter, ignore, skip, or bypass errors or warnings from code, tests, tools, compilers, linters, or validation. Fix the root cause, then rerun the affected check and require a clean result. Expected error-path tests may assert errors, but must not conceal unexpected failures.

Non-negotiable TypeScript type rule: Never use the TypeScript type `any`; always use specific domain types, generics, existing project types, or `unknown` with explicit narrowing in all TypeScript-family files (`.ts`, `.tsx`, `.mts`, `.cts`, and `.d.ts`).

Non-negotiable code organization rule: Functions with the same or equivalent behavior must use the same or clearly corresponding descriptive names across CareCard repositories, and equivalent functionality must live in files with the same names within each repository's established architecture. No backward compatibility names, aliases, or duplicate locations are allowed.

## Features

- **Standardized Response Format**: Consistent JSON structure for all API responses.
- **Request Context Middleware**: Automatic generation of a service-owned `requestId` and W3C trace metadata.
- **Distributed Tracing Support**: Standards-based propagation through W3C `traceparent`.
- **Structured Application Logging**: Dependency-free NDJSON with redaction, correlation, and bounded development files.
- **Type Safety**: Full TypeScript support with included type definitions.
- **Next.js & Express Compatibility**: Works seamlessly across different Node.js frameworks.
- **Microservice Ready**: Built-in metadata for service identification, environment, and versioning.

## Installation

```bash
npm install @carecard/common-util
```

## Usage

### Express.js

#### Setup Middleware

```javascript
const express = require('express');
const { requestContext } = require('@carecard/common-util');

const app = express();

// Attach request context (generates a local requestId and continues or creates a W3C trace)
app.use(requestContext);
```

#### Calling Another Service

```javascript
const { createTracePropagationHeaders } = require('@carecard/common-util');

const response = await fetch('http://ms-auth/api/v1/app-auth/server-auth/jwt/introspect', {
  method: 'POST',
  headers: {
    ...createTracePropagationHeaders(),
    authorization: serviceAuthorization,
  },
});
```

`createTracePropagationHeaders()` continues the active request trace by using
the current service span as the downstream parent. It returns an empty object
when called outside request context.

#### Sending Responses

```javascript
const { sendResponse } = require('@carecard/common-util');

app.get('/api/users', (req, res) => {
  const users = [{ id: 1, name: 'John Doe' }];

  return sendResponse({
    req,
    res,
    message: 'Users fetched successfully',
    data: users,
    meta: {
      pagination: { page: 1, limit: 10, total: 1 },
    },
  });
});
```

#### Standardized Error Handling

```javascript
const { error } = require('@carecard/common-util');
const { appErrorHandler, notFound404, throwRecordNotFoundError } = error;

const app = require('express')();

// Usage in controllers
app.get('/api/users/:id', (req, res) => {
  const user = null;
  if (!user) {
    throwRecordNotFoundError({ userMessage: 'User not found' });
  }
});

// Handle 404s
app.use(notFound404);

// Central error handler
app.use(appErrorHandler);
```

### Next.js (API Routes)

#### JavaScript Example

```javascript
// pages/api/hello.js
import { sendResponse } from '@carecard/common-util';

export default function handler(req, res) {
  return sendResponse({
    req,
    res,
    message: 'Hello from Next.js!',
    data: { greeting: 'Welcome' },
  });
}
```

#### TypeScript Example

```typescript
// pages/api/hello.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { sendResponse } from '@carecard/common-util';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return sendResponse({
    req,
    res,
    message: 'Typed response',
    data: { status: 'ok' },
  });
}
```

## API Reference

### Centralized application logging

Import the server-only logging contract from its dedicated subpath so browser
bundles never include Node.js filesystem or crypto modules:

```javascript
const {
  createApplicationLogger,
  createHttpRequestLogger,
  installFatalProcessLogging,
} = require('@carecard/common-util/logging');

const logger = createApplicationLogger({
  service: 'ms-example',
  serviceVersion: process.env.MS_VERSION,
});

app.use(createHttpRequestLogger(logger));
installFatalProcessLogging(logger);
```

Every call emits one versioned NDJSON record. Production writes to standard
output or standard error for collection by the platform. Development also
writes `logs/application.ndjson` and retains two rotated files; each file is
bounded at 10 MiB. Configure `LOG_FILE_PATH`, `LOG_LEVEL`, and
`LOG_IDENTITY_HMAC_KEY` through the runtime environment.

`LOG_IDENTITY_HMAC_KEY` is mandatory and must contain at least 32 characters in
production. Logs must never contain raw user IDs, email addresses, IP
addresses, user-agent strings, authorization material, cookies, secrets,
tokens, request bodies, headers, or query strings. User identities are
HMAC-SHA256 pseudonyms, and other sensitive values are redacted before
serialization. Keep the same HMAC key across services in one environment so an
authorized operator can correlate an actor without recovering the source ID.

`installFatalProcessLogging` uses Node.js `uncaughtExceptionMonitor`; it observes
fatal errors without installing an exception handler or changing the process
crash contract.

### PostgreSQL read/write routing

Import the server-only routing contract from
`@carecard/common-util/postgres-routing`. It owns three independently bounded
pools for an application process: 11 primary-write connections, 8
replica-read connections, and 1 read-only primary-fallback connection. The
aggregate ceiling is exactly 20. Primary-only database jobs use one explicitly
smaller pool and never construct a replica pool.

Callers declare replica-tolerant work with `runReplicaRead`; missing intent,
writes, migrations, locks, and consistency-sensitive reads remain primary by
default. `runPrimaryWrite` makes a nested execution context primary-sticky, so
later work cannot return to a replica. A transaction must acquire one client
after selecting its context and retain that client until commit or rollback.

Replica sessions are initialized read-only and checked for recovery role,
paused replay, and byte lag before each lease. A verified pre-dispatch
availability or lag failure may acquire the one-connection read-only primary
fallback pool. Authentication, authorization, configuration, and dispatched
query failures fail closed and are never replayed. A 30-second physical
connection lifetime lets Kubernetes distribute new sessions across all healthy
endpoints behind a read Service.

The router exposes Prometheus text for connection counts by pool role, query
routing, replica acquisition failures, primary fallbacks, role mismatches,
circuit state, observer failures, and domain-reported stale reads. Supply
structured logging observers for session and fallback events; never attach SQL,
credentials, hostnames, or personal data to those events.

### `sendResponse({ req, res, statusCode, success, code, message, data, error, details, pagination, meta })`

Sends a standardized JSON response.

### `requestContext(req, res, next)`

Middleware that attaches:

- `req.requestId`: Service-owned UUID v4 unique to this service request.
- `req.traceId`: W3C trace ID continued from `traceparent` or newly generated.
- `req.spanId`: The current service span ID.
- `req.parentSpanId`: The upstream span ID when supplied.
- `req.traceFlags`: W3C trace flags.
- `req.client`: Object containing `appId` (from `x-app-id`) and `ip`.

Request IDs are never accepted as cross-service correlation identifiers. Use
the W3C trace ID to correlate responses and centralized logs across services.

### `createError({ code, message, details, fields })`

Helper to create a standardized error object for `sendResponse`.

## Standard Response Structure

```json
{
  "success": true,
  "status": "success",
  "statusCode": 200,
  "code": "OK",
  "message": "Success message",
  "data": { ... },
  "error": null,
  "details": null,
  "meta": {
    "version": "1.0.0",
    "service": "my-service",
    "environment": "production",
    "timestamp": "2024-03-26T00:00:00.000Z",
    "requestId": "...",
    "traceId": "...",
    "client": { "appId": "...", "ip": "..." }
  }
}
```

## Environment Variables

- `API_VERSION`: Used in `meta.version` (default: `1.0.0`)
- `SERVICE_NAME`: Used in `meta.service` (default: `unknown-service`)
- `NODE_ENV`: Used in `meta.environment` (default: `development`)
- `LOG_LEVEL`: Minimum structured log severity (`debug`, `info`, `warn`, or `error`)
- `LOG_FILE_PATH`: Development NDJSON location
- `LOG_IDENTITY_HMAC_KEY`: Shared secret for one-way user identity pseudonyms

## Auth And RLS Error Boundaries

Services should use shared response/error helpers without exposing auth-table
or SQL internals. `ms-auth` now enforces its auth tables with forced RLS:
normal users are self-row only, JWT `roles: ["ad"]` is the auth super-admin
signal, and public auth flows use narrow system contexts. Error responses
should report safe authentication or authorization failures without leaking RLS
policy details, JWT payloads, or database context values.
PostgreSQL RLS failures with SQLSTATE `42501` are reported as
`NOT_AUTHORIZED` with the user-facing message
`Not permitted to perform the action` and no response details.

Docs that mention `ms-auth` controller internals should use concise action
names such as `loginUser`, `registerUser`, `getUserDetail`, and `renewJwt`.
Access level is conveyed by route middleware and endpoint placement, not by
`public`/`protected`/`admin`/`Handler` suffixes.

## License

ISC

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
