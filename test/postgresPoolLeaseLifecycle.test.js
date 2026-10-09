'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { createPostgresPoolRuntime } = require('@carecard/common-util/postgres-routing');

describe('PostgreSQL pool lease lifecycle', function () {
  it('leaves returned clients available after repeated acquisition and release', async function () {
    const { pool, runtime } = createRuntime();
    for (let lease = 0; lease < 200; lease += 1) {
      const client = await runtime.connect(client => client);
      assert.deepEqual(await client.query('SELECT 1'), { rows: [{ value: 1 }] });
      client.release();
    }
    assert.equal(runtime.forceCloseCheckedOutClients(), 0);
    const client = await runtime.connect(client => client);
    assert.deepEqual(await client.query('SELECT 1'), { rows: [{ value: 1 }] });
    client.release();
    await runtime.endPool();
    assert.equal(pool.totalCount, 0);
  });

  it('does not retain destroyed clients after their second lease', async function () {
    const { runtime } = createRuntime();
    const first = await runtime.connect(client => client);
    first.release();
    const second = await runtime.connect(client => client);
    second.release(true);
    assert.equal(runtime.forceCloseCheckedOutClients(), 0);
    const replacement = await runtime.connect(client => client);
    assert.deepEqual(await replacement.query('SELECT 1'), { rows: [{ value: 1 }] });
    replacement.release();
    await runtime.endPool();
  });

  it('rejects an old release without ending a currently checked-out lease', async function () {
    const { runtime } = createRuntime();
    const first = await runtime.connect(client => client);
    const releaseFirst = first.release;
    first.release();
    const second = await runtime.connect(client => client);
    assert.throws(() => releaseFirst(), /already released/u);
    assert.deepEqual(await second.query('SELECT 1'), { rows: [{ value: 1 }] });
    assert.equal(runtime.forceCloseCheckedOutClients(), 1);
    await assert.rejects(second.query('SELECT 1'), /closed/u);
    await runtime.endPool();
  });

  it('destroys a failed initialization lease without retaining shutdown ownership', async function () {
    const { runtime } = createRuntime();
    await assert.rejects(
      runtime.connect(() => {
        throw new Error('session initialization failed');
      }),
      /session initialization failed/u,
    );
    assert.equal(runtime.forceCloseCheckedOutClients(), 0);
    await runtime.endPool();
  });

  it('preserves released-client ownership through the ESM entrypoint', async function () {
    const { createPostgresPoolRuntime: createEsmRuntime } =
      await import('@carecard/common-util/postgres-routing');
    const { runtime } = createRuntime(createEsmRuntime);
    for (let lease = 0; lease < 3; lease += 1) {
      const client = await runtime.connect(client => client);
      client.release();
    }
    assert.equal(runtime.forceCloseCheckedOutClients(), 0);
    await runtime.endPool();
  });
});

// Pattern: Test Boundary - supplies only the documented pg Pool protocol to the public runtime.
function createRuntime(create = createPostgresPoolRuntime) {
  const pool = new LeasePool();
  const runtime = create({ pool, maximum: 1, serviceName: 'ms-example' });
  return { pool, runtime };
}

class LeasePool extends EventEmitter {
  // Pattern: Protocol Fake - owns one physical connection and its acquired leases.
  constructor() {
    super();
    this.client = undefined;
    this.totalCount = 0;
    this.idleCount = 0;
    this.waitingCount = 0;
  }

  // Pattern: Lease Factory - gives each checkout its own single-use release boundary.
  async connect() {
    if (!this.client) {
      this.client = new LeaseClient();
      this.totalCount = 1;
      this.emit('connect', this.client);
    }
    const client = this.client;
    let released = false;
    this.idleCount = 0;
    client.release = destroy => {
      if (released) {
        throw new Error('Client already released');
      }
      released = true;
      this.emit('release', undefined, client);
      if (destroy) {
        client.closed = true;
        this.client = undefined;
        this.totalCount = 0;
        this.emit('remove', client);
      } else {
        this.idleCount = 1;
      }
    };
    this.emit('acquire', client);
    return client;
  }

  // Pattern: Resource Owner - closes the physical connection when the public pool ends.
  async end() {
    if (this.client) {
      this.client.closed = true;
    }
    this.client = undefined;
    this.totalCount = 0;
    this.idleCount = 0;
  }
}

class LeaseClient {
  // Pattern: Callable Database Boundary - returns a controlled result or a closed-connection error.
  async query() {
    if (this.closed) {
      throw new Error('Connection closed');
    }
    return { rows: [{ value: 1 }] };
  }
}
