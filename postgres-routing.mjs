import postgresRouting from './postgres-routing.js';

export const {
  createDatabaseExecutionContext,
  createPostgresPoolRuntime,
  createPostgresReadWriteRouter,
  createPostgresRoutingConfig,
} = postgresRouting;

export default postgresRouting;
