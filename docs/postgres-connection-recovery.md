# PostgreSQL connection recovery

Apply $carecard-workspace-standards and $pkg-publish to this shared mechanism.

`createPostgresPoolRuntime` owns the lifecycle of borrowed database clients.
Clients that expose an `error` event are observed from their physical
connection until removal. A connection failure during a lease is reported
through the caller's `onPoolError` observer and counted in
`carecard_postgres_pool_errors_total` with `source="client"`.

The caller still receives the original query rejection. No query or
transaction is retried. Releasing a failed lease removes that physical
connection instead of returning it for reuse, so later callers can acquire a
usable connection. Existing idle-pool error reporting remains owned by the
pool, without duplicate notifications from the leased-client observer.

Query-only client adapters continue to report failures through their query
promises. Their interface does not require an event channel. Error observers
must retain the owning application's existing sanitized logging policy;
packages do not decide application roles, permissions or delivery policy.

The public CommonJS and ESM regression cases exercise lost leases, pending
query failures, subsequent successful queries and unchanged idle-error
reporting. Run them with the existing lease and routing tests, then the full
native package gates. Consuming database services must also exercise the
published change against their own test database.

Non-negotiable repository isolation rule: Every repository must run its Husky hooks and tests using only files, code, fixtures, dependencies, and services contained within that repository. Tests and Husky scripts must not import, require, read, execute, or otherwise depend on sibling repositories or paths outside the repository root. app-e2e-tests is the only exception because cross-repository end-to-end testing is its explicit responsibility.
