# @carecard/common-util

Non-negotiable root-cause solution rule: Always identify and solve the verified root cause, use the stronger solution, and deliver a correct, durable, production-quality result. Never treat a temporary workaround, resource increase, retry, suppression, bypass, or symptom-only patch as completion. Validate the root-cause fix against the real failing workflow and prove the end state.

Standardized API response system, request context middleware, and utility functions for Express.js and Next.js microservices.

## Development Rule

Non-negotiable TDD rule: Always write the failing test first, run it to confirm it fails for the intended reason, then implement the code and rerun the test until it passes. Test Driven Development is required for all coding work and must not be skipped. For documentation- or skill-only edits, add or update the relevant validation check before changing the prose.

Non-negotiable repository isolation rule: Every repository must run its Husky hooks and tests using only files, code, fixtures, dependencies, and services contained within that repository. Tests and Husky scripts must not import, require, read, execute, or otherwise depend on sibling repositories or paths outside the repository root. app-e2e-tests is the only exception because cross-repository end-to-end testing is its explicit responsibility.

Non-negotiable error and warning rule: Never suppress, silence, hide, downgrade, filter, ignore, skip, or bypass errors or warnings from code, tests, tools, compilers, linters, or validation. Fix the root cause, then rerun the affected check and require a clean result. Expected error-path tests may assert errors, but must not conceal unexpected failures.

Non-negotiable code organization rule: Functions with the same or equivalent behavior must use the same or clearly corresponding descriptive names across CareCard repositories, and equivalent functionality must live in files with the same names within each repository's established architecture. No backward compatibility names, aliases, or duplicate locations are allowed.

## Features

- **Standardized Response Format**: Consistent JSON structure for all API responses.
- **Request Context Middleware**: Automatic generation of a service-owned `requestId` and W3C trace metadata.
- **Distributed Tracing Support**: Standards-based propagation through W3C `traceparent`.
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
    authorization: serviceAuthorization
  }
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
      pagination: { page: 1, limit: 10, total: 1 }
    }
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
    data: { greeting: 'Welcome' }
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
    data: { status: 'ok' }
  });
}
```

## API Reference

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
