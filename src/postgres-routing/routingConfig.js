'use strict';

const { isIP } = require('node:net');

const APPLICATION_POOL_MAXIMUM = 20;
const FALLBACK_POOL_MAXIMUM = 1;
const PRIMARY_WRITE_POOL_MAXIMUM = 11;
const REPLICA_READ_POOL_MAXIMUM = 8;
const DEFAULT_MAX_REPLICA_LAG_BYTES = 16 * 1024 * 1024;

// Pattern: Configuration Factory - builds a validated role-aware PostgreSQL pool contract.
function createPostgresRoutingConfig(options) {
  validateBaseOptions(options);
  if (options.databaseJob || options.mode === 'primary-only') {
    return createPrimaryOnlyConfig(options);
  }
  validateReplicaPreferredOptions(options);
  return createReplicaPreferredConfig(options);
}

// Pattern: Guard Clause - validates the shared routing inputs without exposing values.
function validateBaseOptions(options) {
  if (!options || !['primary-only', 'replica-preferred'].includes(options.mode)) {
    throw configurationError('mode');
  }
  if (!isServiceName(options.serviceName) || !options.primaryConnectionConfig) {
    throw configurationError('primaryConnectionConfig');
  }
  validatePoolMaximum(options);
  validateReplicaLag(options.maxReplicaLagBytes);
  validateSearchPath(options.searchPath);
}

// Pattern: Guard Clause - enforces the reviewed twenty-connection application budget.
function validateReplicaPreferredOptions(options) {
  const maximum = options.poolMaximum ?? options.primaryConnectionConfig.max;
  if (maximum !== APPLICATION_POOL_MAXIMUM) {
    throw configurationError('poolMaximum');
  }
  validateDatabaseHost(options.readHost);
}

// Pattern: Configuration Projection - preserves one primary-only pool for jobs and disabled routing.
function createPrimaryOnlyConfig(options) {
  const baseConfig = {
    ...options.primaryConnectionConfig,
    max: options.poolMaximum ?? options.primaryConnectionConfig.max,
  };
  return {
    maxReplicaLagBytes: options.maxReplicaLagBytes ?? DEFAULT_MAX_REPLICA_LAG_BYTES,
    mode: 'primary-only',
    primaryWrite: createPoolDefinition('primary-write', baseConfig, false, false),
    searchPath: options.searchPath,
    serviceName: options.serviceName,
  };
}

// Pattern: Capacity Guard - permits bounded primary-only pools during a coordinated rollout.
function validatePoolMaximum(options) {
  const maximum = options.poolMaximum ?? options.primaryConnectionConfig.max;
  if (!Number.isInteger(maximum) || maximum < 1 || maximum > APPLICATION_POOL_MAXIMUM) {
    throw configurationError('poolMaximum');
  }
}

// Pattern: Input Validation - accepts only a bounded non-negative WAL byte threshold.
function validateReplicaLag(maxReplicaLagBytes) {
  if (maxReplicaLagBytes === undefined) {
    return;
  }
  if (!Number.isSafeInteger(maxReplicaLagBytes) || maxReplicaLagBytes < 0) {
    throw configurationError('maxReplicaLagBytes');
  }
}

// Pattern: Configuration Projection - divides exactly twenty connections among safe endpoint roles.
function createReplicaPreferredConfig(options) {
  const baseConfig = options.primaryConnectionConfig;
  return {
    maxReplicaLagBytes: options.maxReplicaLagBytes ?? DEFAULT_MAX_REPLICA_LAG_BYTES,
    mode: 'replica-preferred',
    primaryReadFallback: createReadPool(
      'primary-read-fallback',
      baseConfig,
      baseConfig.host,
      false,
      FALLBACK_POOL_MAXIMUM,
    ),
    primaryWrite: createRoutedPool(
      'primary-write',
      baseConfig,
      false,
      false,
      PRIMARY_WRITE_POOL_MAXIMUM,
    ),
    replicaRead: createReadPool(
      'replica-read',
      baseConfig,
      options.readHost,
      true,
      REPLICA_READ_POOL_MAXIMUM,
    ),
    searchPath: options.searchPath,
    serviceName: options.serviceName,
  };
}

// Pattern: Data Builder - binds a physical pool to its expected database role.
function createPoolDefinition(role, connectionConfig, expectedInRecovery, readOnly) {
  return { connectionConfig, expectedInRecovery, readOnly, role };
}

// Pattern: Data Builder - creates one bounded role-specific pool configuration.
function createRoutedPool(role, baseConfig, expectedInRecovery, readOnly, maximum) {
  const connectionConfig = {
    ...baseConfig,
    application_name: `${baseConfig.application_name.split(':')[0]}:${role}`,
    max: maximum,
    maxLifetimeSeconds: 30,
    min: 0,
  };
  return createPoolDefinition(role, connectionConfig, expectedInRecovery, readOnly);
}

// Pattern: Security Configuration - forces all read-role sessions into PostgreSQL read-only mode.
function createReadPool(role, baseConfig, host, expectedInRecovery, maximum) {
  const definition = createRoutedPool(role, baseConfig, expectedInRecovery, true, maximum);
  definition.connectionConfig = {
    ...definition.connectionConfig,
    connectionTimeoutMillis: 1000,
    host,
    options: '-c default_transaction_read_only=on',
  };
  return definition;
}

// Pattern: Input Validation - permits DNS names and IP literals without URI syntax.
function validateDatabaseHost(host) {
  if (typeof host !== 'string' || host.length === 0 || host.length > 253) {
    throw configurationError('readHost');
  }
  if (isIP(host) !== 0) {
    return;
  }
  const validLabel = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/u;
  if (host.split('.').some(label => !validLabel.test(label))) {
    throw configurationError('readHost');
  }
}

// Pattern: Input Validation - permits only identifier-safe PostgreSQL search-path entries.
function validateSearchPath(searchPath) {
  const validIdentifier = /^[a-z_][a-z0-9_]*$/u;
  if (!Array.isArray(searchPath) || searchPath.length === 0) {
    throw configurationError('searchPath');
  }
  if (searchPath.some(identifier => !validIdentifier.test(identifier))) {
    throw configurationError('searchPath');
  }
}

// Pattern: Input Validation - accepts low-cardinality service metric labels only.
function isServiceName(serviceName) {
  return typeof serviceName === 'string' && /^ms-[a-z0-9-]+$/u.test(serviceName);
}

// Pattern: Safe Error Factory - reports only the invalid setting name.
function configurationError(settingName) {
  const error = new Error(`Invalid PostgreSQL routing configuration: ${settingName}`);
  error.code = 'Configuration_Error';
  return error;
}

module.exports = {
  APPLICATION_POOL_MAXIMUM,
  createPostgresRoutingConfig,
};
