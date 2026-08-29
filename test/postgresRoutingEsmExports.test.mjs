import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';
import {
  createDatabaseExecutionContext,
  createPostgresRoutingConfig,
} from '../postgres-routing.mjs';

describe('PostgreSQL routing ESM exports', () => {
  it('exposes the same validated routing contract to ESM consumers', async () => {
    const executionContext = createDatabaseExecutionContext();
    const config = createPostgresRoutingConfig({
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
    });

    const selectedRole = await executionContext.runReplicaRead(() => executionContext.getRole());

    assert.equal(selectedRole, 'replica-read');
    assert.equal(config.replicaRead.connectionConfig.host, 'ms-example-db-ro');
  });
});
