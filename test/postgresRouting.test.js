'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { describe, it } = require('mocha');
const {
  createDatabaseExecutionContext,
  createPostgresReadWriteRouter,
  createPostgresRoutingConfig,
} = require('../postgres-routing');

describe('PostgreSQL read/write routing', function () {
  it('enforces one aggregate twenty-connection application budget', function () {
    const config = createRoutingConfig();

    assert.deepEqual(summarizePoolMaximums(config), {
      primaryWrite: 11,
      replicaRead: 8,
      primaryReadFallback: 1,
      total: 20,
    });
    assert.throws(
      () => createRoutingConfig({ poolMaximum: 21 }),
      error => error.code === 'Configuration_Error',
    );
  });

  it('routes declared reads to replicas and keeps nested writes sticky to the primary', async function () {
    const runtime = createRoutingRuntime();

    assert.equal(await querySelectedRole(runtime), 'primary-write');
    await runtime.executionContext.runReplicaRead(async () => {
      assert.equal(await querySelectedRole(runtime), 'replica-read');
      await runtime.executionContext.runPrimaryWrite(async () => {
        assert.equal(await querySelectedRole(runtime), 'primary-write');
      });
      assert.equal(await querySelectedRole(runtime), 'primary-write');
    });
  });

  it('falls back before dispatch when replica acquisition fails and emits bounded telemetry', async function () {
    const events = [];
    const runtime = createRoutingRuntime({
      behaviors: { 'replica-read': { connectErrors: [createError('ECONNREFUSED')] } },
      observers: { onRoutingEvent: event => events.push(event) },
    });

    const selectedRole = await runtime.executionContext.runReplicaRead(() =>
      querySelectedRole(runtime),
    );

    assert.equal(selectedRole, 'primary-read-fallback');
    assert.deepEqual(events, [
      {
        event: 'primary_fallback',
        reason: 'connect',
        role: 'primary-read-fallback',
        serviceName: 'ms-example',
      },
    ]);
    assert.match(
      runtime.router.getPoolMetrics(),
      /carecard_postgres_read_fallback_total\{service="ms-example",reason="connect"\} 1/u,
    );
  });

  it('rejects lagging and paused replicas before a user query reaches them', async function () {
    for (const replicaBehavior of [{ lagBytes: 16 * 1024 * 1024 + 1 }, { replayPaused: true }]) {
      const runtime = createRoutingRuntime({
        behaviors: { 'replica-read': replicaBehavior },
      });

      const selectedRole = await runtime.executionContext.runReplicaRead(() =>
        querySelectedRole(runtime),
      );

      assert.equal(selectedRole, 'primary-read-fallback');
      assert.equal(runtime.pools.get('replica-read').userQueries, 0);
      assert.match(runtime.router.getPoolMetrics(), /reason="(?:lag|replay)"\} 1/u);
    }
  });

  it('revalidates a reused replica before every user-query lease', async function () {
    const replicaBehavior = { lagBytes: 0, reuseClient: true };
    const runtime = createRoutingRuntime({
      behaviors: { 'replica-read': replicaBehavior },
    });

    assert.equal(
      await runtime.executionContext.runReplicaRead(() => querySelectedRole(runtime)),
      'replica-read',
    );
    runtime.pools.get('replica-read').behavior.lagBytes = 16 * 1024 * 1024 + 1;
    assert.equal(
      await runtime.executionContext.runReplicaRead(() => querySelectedRole(runtime)),
      'primary-read-fallback',
    );
    assert.equal(runtime.pools.get('replica-read').userQueries, 1);
  });

  it('rejects unsafe application budgets and replica lag thresholds at startup', function () {
    assert.throws(
      () => createRoutingConfig({ maxReplicaLagBytes: -1 }),
      error => error.code === 'Configuration_Error',
    );
    assert.throws(
      () => createRoutingConfig({ mode: 'primary-only', poolMaximum: 19 }),
      error => error.code === 'Configuration_Error',
    );
    assert.doesNotThrow(() =>
      createRoutingConfig({ databaseJob: true, mode: 'primary-only', poolMaximum: 2 }),
    );
  });

  it('isolates observer failures and exposes them as routing telemetry', async function () {
    const runtime = createRoutingRuntime({
      behaviors: { 'replica-read': { connectErrors: [createError('ECONNREFUSED')] } },
      observers: {
        onRoutingEvent: () => {
          throw new Error('observer failure');
        },
      },
    });

    assert.equal(
      await runtime.executionContext.runReplicaRead(() => querySelectedRole(runtime)),
      'primary-read-fallback',
    );
    assert.match(
      runtime.router.getPoolMetrics(),
      /carecard_postgres_routing_observer_failures_total\{service="ms-example"\} 1/u,
    );
  });

  it('fails closed for authentication errors and never replays a dispatched query', async function () {
    const authenticationFailure = createError('28P01');
    const authenticationRuntime = createRoutingRuntime({
      behaviors: { 'replica-read': { connectErrors: [authenticationFailure] } },
    });

    await assert.rejects(
      () =>
        authenticationRuntime.executionContext.runReplicaRead(() =>
          querySelectedRole(authenticationRuntime),
        ),
      error => error === authenticationFailure,
    );
    assert.equal(authenticationRuntime.pools.get('primary-read-fallback').connectionAttempts, 0);

    const dispatchedFailure = createError('ECONNRESET');
    const queryRuntime = createRoutingRuntime({
      behaviors: { 'replica-read': { userQueryErrors: [dispatchedFailure] } },
    });
    await assert.rejects(
      () => queryRuntime.executionContext.runReplicaRead(() => querySelectedRole(queryRuntime)),
      error => error === dispatchedFailure,
    );
    assert.equal(queryRuntime.pools.get('primary-read-fallback').userQueries, 0);
  });

  it('reports routing roles and closes every constructed pool exactly once', async function () {
    const runtime = createRoutingRuntime();

    await querySelectedRole(runtime);
    await runtime.executionContext.runReplicaRead(() => querySelectedRole(runtime));
    await runtime.router.endPools();
    await runtime.router.endPools();

    const metrics = runtime.router.getPoolMetrics();
    assert.match(metrics, /pool_role="primary-write"/u);
    assert.match(metrics, /pool_role="replica-read"/u);
    assert.match(metrics, /carecard_postgres_queries_total.*pool_role="primary-write".* 1/u);
    assert.match(metrics, /carecard_postgres_queries_total.*pool_role="replica-read".* 1/u);
    assert.doesNotMatch(metrics, /password|hostname|query=/iu);
    for (const pool of runtime.pools.values()) {
      assert.equal(pool.endCalls, 1);
    }
  });
});

// Pattern: Test Data Builder - creates the public twenty-connection routing contract.
function createRoutingConfig(overrides = {}) {
  return createPostgresRoutingConfig({
    mode: 'replica-preferred',
    poolMaximum: 20,
    primaryConnectionConfig: {
      application_name: 'ms-example:server',
      host: 'ms-example-db-rw',
      max: 20,
    },
    readHost: 'ms-example-db-ro',
    searchPath: ['example', 'public'],
    serviceName: 'ms-example',
    ...overrides,
  });
}

// Pattern: Test Projection - presents only externally meaningful connection ceilings.
function summarizePoolMaximums(config) {
  const primaryWrite = config.primaryWrite.connectionConfig.max;
  const replicaRead = config.replicaRead.connectionConfig.max;
  const primaryReadFallback = config.primaryReadFallback.connectionConfig.max;
  return {
    primaryWrite,
    replicaRead,
    primaryReadFallback,
    total: primaryWrite + replicaRead + primaryReadFallback,
  };
}

// Pattern: Test Fixture - creates role-aware pools with controlled public outcomes.
function createRoutingRuntime({ behaviors = {}, observers = {} } = {}) {
  const pools = new Map();
  const executionContext = createDatabaseExecutionContext();
  const router = createPostgresReadWriteRouter({
    createPool: connectionConfig => {
      const role = connectionConfig.application_name.split(':')[1];
      const pool = new FakePool(role, behaviors[role]);
      pools.set(role, pool);
      return pool;
    },
    databaseConfig: createRoutingConfig(),
    executionContext,
    observers,
  });
  return { executionContext, pools, router };
}

// Pattern: Test Boundary - dispatches one user query through the selected public pool role.
async function querySelectedRole(runtime) {
  const client = await runtime.router.getClient();
  try {
    runtime.router.recordQuery(client);
    const result = await client.query('SELECT public_result');
    return result.rows[0].poolRole;
  } finally {
    client.release();
  }
}

// Pattern: Test Data Builder - creates a database error with one public code.
function createError(code) {
  return Object.assign(new Error(`database error ${code}`), { code });
}

class FakePool extends EventEmitter {
  // Pattern: Test Double - models the observable pg Pool acquisition and lifecycle boundary.
  constructor(role, behavior = {}) {
    super();
    this.role = role;
    this.behavior = {
      connectErrors: [],
      inRecovery: role === 'replica-read',
      lagBytes: 0,
      replayPaused: false,
      reuseClient: false,
      userQueryErrors: [],
      ...behavior,
    };
    this.connectionAttempts = 0;
    this.endCalls = 0;
    this.idleCount = 0;
    this.totalCount = 0;
    this.waitingCount = 0;
    this.userQueries = 0;
  }

  // Pattern: Protocol Fake - returns a client or the next configured acquisition failure.
  async connect() {
    this.connectionAttempts += 1;
    const error = this.behavior.connectErrors.shift();
    if (error) {
      throw error;
    }
    const client = this.behavior.reuseClient
      ? (this.reusedClient ??= new FakeClient(this))
      : new FakeClient(this);
    this.totalCount += 1;
    this.emit('connect', client);
    return client;
  }

  // Pattern: Lifecycle Fake - records one physical pool shutdown.
  async end() {
    this.endCalls += 1;
  }
}

class FakeClient extends EventEmitter {
  // Pattern: Test Double - retains its selected role and parent pool behavior.
  constructor(pool) {
    super();
    this.pool = pool;
  }

  // Pattern: Protocol Fake - exposes role, WAL, and user-query outcomes.
  async query(query) {
    const text = typeof query === 'string' ? query : query.text;
    if (/pg_is_in_recovery/u.test(text)) {
      return this.createRoleResult();
    }
    if (/pg_current_wal_lsn/u.test(text)) {
      return { rows: [{ current_lsn: '0/2000000' }] };
    }
    if (/pg_wal_lsn_diff/u.test(text)) {
      return { rows: [{ lag_bytes: this.pool.behavior.lagBytes }] };
    }
    if (/^SET /u.test(text)) {
      return { rows: [] };
    }
    return this.runUserQuery();
  }

  // Pattern: Test Projection - returns the observable PostgreSQL recovery state.
  createRoleResult() {
    return {
      rows: [
        {
          in_recovery: this.pool.behavior.inRecovery,
          replay_lsn: this.pool.behavior.inRecovery ? '0/1000000' : null,
          replay_paused: this.pool.behavior.replayPaused,
        },
      ],
    };
  }

  // Pattern: Outcome Fake - dispatches one user query without automatic replay.
  runUserQuery() {
    this.pool.userQueries += 1;
    const error = this.pool.behavior.userQueryErrors.shift();
    if (error) {
      throw error;
    }
    return { rows: [{ poolRole: this.pool.role }] };
  }

  // Pattern: Lifecycle Fake - completes one checked-out client lease.
  release() {}
}
