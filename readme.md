# @carecard/common-util

Standardized API response system, request context middleware, and utility functions for Express.js and Next.js microservices.

## Features

- **Standardized Response Format**: Consistent JSON structure for all API responses.
- **Request Context Middleware**: Automatic generation of `requestId` and `traceId`.
- **Distributed Tracing Support**: Header-based trace propagation (`x-trace-id`).
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

// Attach request context (generates requestId, traceId, extracts client info)
app.use(requestContext);
```

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

- `req.requestId`: UUID v4 unique to the request.
- `req.traceId`: Propagated from `x-trace-id` header or newly generated.
- `req.client`: Object containing `appId` (from `x-app-id`) and `ip`.

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

## License

ISC
