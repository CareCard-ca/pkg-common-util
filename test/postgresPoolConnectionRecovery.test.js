'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { createPostgresPoolRuntime } = require('@carecard/common-util/postgres-routing');

describe('PostgreSQL connection recovery', function () {
  for (const entrypoint of ['CommonJS', 'ESM']) {
    it(`${entrypoint} reports a lost lease and makes the next connection usable`, async function () {
      const { pool, runtime, errors } = await createRecoveryScenario(entrypoint);
      const failure = Object.assign(new Error('Connection reset'), { code: 'ECONNRESET' });
      try {
        const client = await runtime.connect(client => client);
        assert.deepEqual(await client.query('SELECT 1'), { rows: [{ value: 1 }] });
        assert.doesNotThrow(() => pool.interruptConnection(failure));
        await assert.rejects(client.query('SELECT 1'), error => error === failure);
        client.release();
        const replacement = await runtime.connect(client => client);
        assert.deepEqual(await replacement.query('SELECT 1'), { rows: [{ value: 1 }] });
        replacement.release();
        assert.deepEqual(
          errors.map(error => error.code),
          ['ECONNRESET'],
        );
      } finally {
        runtime.forceCloseCheckedOutClients();
        await runtime.endPool();
      }
    });
  }

  it('preserves a pending query rejection while reporting its connection failure', async function () {
    const { pool, runtime, errors } = await createRecoveryScenario();
    const failure = Object.assign(new Error('Connection reset'), { code: 'ECONNRESET' });
    try {
      const client = await runtime.connect(client => client);
      pool.blockNextQuery();
      const rejected = assert.rejects(client.query('SELECT 1'), error => error === failure);
      assert.doesNotThrow(() => pool.interruptConnection(failure));
      await rejected;
      client.release();
      const replacement = await runtime.connect(client => client);
      assert.deepEqual(await replacement.query('SELECT 1'), { rows: [{ value: 1 }] });
      replacement.release();
      assert.deepEqual(
        errors.map(error => error.code),
        ['ECONNRESET'],
      );
    } finally {
      runtime.forceCloseCheckedOutClients();
      await runtime.endPool();
    }
  });

  it('keeps idle connection errors reported through the existing pool boundary', async function () {
    const { pool, runtime, errors } = await createRecoveryScenario();
    const failure = Object.assign(new Error('Server closed connection'), { code: '57P01' });
    try {
      const client = await runtime.connect(client => client);
      client.release();
      assert.doesNotThrow(() => pool.interruptConnection(failure));
      const replacement = await runtime.connect(client => client);
      assert.deepEqual(await replacement.query('SELECT 1'), { rows: [{ value: 1 }] });
      replacement.release();
      assert.deepEqual(
        errors.map(error => error.code),
        ['57P01'],
      );
    } finally {
      runtime.forceCloseCheckedOutClients();
      await runtime.endPool();
    }
  });
});

// Pattern: Public Protocol Fixture - supplies connection events and observable query outcomes.
async function createRecoveryScenario(entrypoint = 'CommonJS') {
  const create =
    entrypoint === 'ESM'
      ? (await import('@carecard/common-util/postgres-routing')).createPostgresPoolRuntime
      : createPostgresPoolRuntime;
  const pool = new InterruptiblePool();
  const errors = [];
  const runtime = create({
    pool,
    maximum: 1,
    serviceName: 'connection-recovery-example',
    onPoolError: error => errors.push(error),
  });
  return { pool, runtime, errors };
}

class InterruptiblePool extends EventEmitter {
  constructor() {
    super();
    this.client = undefined;
    this.totalCount = 0;
    this.idleCount = 0;
    this.waitingCount = 0;
  }

  async connect() {
    if (!this.client) {
      this.openConnection();
    }
    const client = this.client;
    client.off('error', this.idleListener);
    this.idleCount = 0;
    let released = false;
    client.release = destroy => {
      if (released) {
        throw new Error('Client already released');
      }
      released = true;
      if (destroy) {
        this.removeConnection(client);
      } else {
        this.idleCount = 1;
        client.on('error', this.idleListener);
      }
    };
    return client;
  }

  openConnection() {
    const client = new InterruptibleClient();
    this.client = client;
    this.totalCount = 1;
    this.idleListener = error => {
      this.removeConnection(client);
      this.emit('error', error, client);
    };
    this.emit('connect', client);
  }

  blockNextQuery() {
    this.client.blockNextQuery = true;
  }

  interruptConnection(error) {
    const client = this.client;
    client.failure = error;
    client.rejectPending?.(error);
    client.emit('error', error);
  }

  removeConnection(client) {
    client.off('error', this.idleListener);
    client.failure ??= new Error('Connection closed');
    this.client = undefined;
    this.totalCount = 0;
    this.idleCount = 0;
    this.emit('remove', client);
  }

  async end() {
    if (this.client) {
      this.removeConnection(this.client);
    }
  }
}

class InterruptibleClient extends EventEmitter {
  async query() {
    if (this.failure) {
      throw this.failure;
    }
    if (this.blockNextQuery) {
      this.blockNextQuery = false;
      return new Promise((_resolve, reject) => {
        this.rejectPending = reject;
      });
    }
    return { rows: [{ value: 1 }] };
  }
}
