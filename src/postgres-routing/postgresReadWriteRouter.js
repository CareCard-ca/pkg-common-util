'use strict';

const { REPLICA_READ_ROLE } = require('./databaseExecutionContext');
const { createPostgresPoolRuntime } = require('./postgresPoolRuntime');

const CLIENT_POOL_ROLE = Symbol('carecard.databasePoolRole');
const CIRCUIT_BASE_DELAY_MILLISECONDS = 5_000;
const CIRCUIT_MAX_DELAY_MILLISECONDS = 30_000;
const PRIMARY_LSN_CACHE_MILLISECONDS = 1_000;
const TRANSIENT_DATABASE_ERROR_CODES = new Set([
  '08000',
  '08001',
  '08003',
  '08004',
  '08006',
  '08007',
  '08P01',
  '53300',
  '53400',
  '57P01',
  '57P02',
  '57P03',
  'ECONNREFUSED',
  'ECONNRESET',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'ETIMEDOUT',
]);
const FALLBACK_ROUTING_ERROR_CODES = new Set([
  'DATABASE_PRIMARY_LSN_UNAVAILABLE',
  'DATABASE_REPLICA_LAG',
  'DATABASE_REPLICA_REPLAY_UNAVAILABLE',
  'DATABASE_ROLE_MISMATCH',
]);

// Pattern: Facade - owns role-aware PostgreSQL acquisition, lifecycle, and telemetry.
function createPostgresReadWriteRouter(options) {
  validateRouterDependencies(options);
  const state = createRoutingState(options);
  state.endpoints = createPoolEndpoints(state, options.createPool);
  return createRouterFacade(state);
}

// Pattern: Guard Clause - rejects incomplete dependencies before opening sockets.
function validateRouterDependencies(options) {
  if (typeof options?.createPool !== 'function') {
    throw new TypeError('createPool must be a function');
  }
  if (!options.databaseConfig || typeof options.executionContext?.getRole !== 'function') {
    throw new TypeError('Database routing configuration and execution context are required');
  }
}

// Pattern: Runtime State - owns bounded routing counters and circuit state.
function createRoutingState(options) {
  return {
    circuitFailures: 0,
    circuitOpenUntil: 0,
    databaseConfig: options.databaseConfig,
    endpoints: undefined,
    executionContext: options.executionContext,
    fallbackCounts: createRoleCounters(['circuit_open', 'connect', 'lag', 'replay', 'role']),
    halfOpenProbeInProgress: false,
    markError: options.markError ?? (error => error),
    observerFailures: 0,
    observers: options.observers ?? {},
    primaryLsnCache: { expiresAt: 0, promise: undefined, value: undefined },
    queryCounts: createRoleCounters(['primary-write', 'replica-read', 'primary-read-fallback']),
    staleReadErrors: 0,
  };
}

// Pattern: Counter Factory - creates fixed low-cardinality metric state.
function createRoleCounters(labels) {
  return Object.fromEntries(labels.map(label => [label, 0]));
}

// Pattern: Factory - constructs only endpoint roles enabled by configuration.
function createPoolEndpoints(state, createPool) {
  const primaryWrite = createPoolEndpoint(state, state.databaseConfig.primaryWrite, createPool);
  if (state.databaseConfig.mode === 'primary-only') {
    return { primaryWrite };
  }
  return {
    primaryReadFallback: createPoolEndpoint(
      state,
      state.databaseConfig.primaryReadFallback,
      createPool,
    ),
    primaryWrite,
    replicaRead: createPoolEndpoint(state, state.databaseConfig.replicaRead, createPool),
  };
}

// Pattern: Resource Factory - gives one physical pool one session and lifecycle owner.
function createPoolEndpoint(state, definition, createPool) {
  validatePoolDefinition(definition);
  const endpoint = {
    definition,
    initializedClients: new WeakSet(),
    pool: createPool(definition.connectionConfig),
    roleValidationFailures: 0,
  };
  endpoint.runtime = createEndpointRuntime(state, endpoint);
  endpoint.getClient = () =>
    endpoint.runtime.connect(client => initializeClient(state, endpoint, client));
  return endpoint;
}

// Pattern: Guard Clause - validates one endpoint's complete role contract.
function validatePoolDefinition(definition) {
  const roles = ['primary-write', 'replica-read', 'primary-read-fallback'];
  if (!definition || typeof definition.expectedInRecovery !== 'boolean') {
    throw new TypeError('PostgreSQL endpoint recovery role is required');
  }
  if (!roles.includes(definition.role) || !definition.connectionConfig?.application_name) {
    throw new TypeError('PostgreSQL endpoint pool role is required');
  }
  if (!Number.isInteger(definition.connectionConfig.max) || definition.connectionConfig.max < 1) {
    throw new TypeError('PostgreSQL endpoint maximum is required');
  }
}

// Pattern: Adapter - attaches shared pool diagnostics to one endpoint role.
function createEndpointRuntime(state, endpoint) {
  return createPostgresPoolRuntime({
    markError: state.markError,
    maximum: endpoint.definition.connectionConfig.max,
    onConnect: state.observers.onConnect,
    onPoolError: state.observers.onPoolError,
    onRemove: state.observers.onRemove,
    pool: endpoint.pool,
    serviceName: state.databaseConfig.serviceName,
  });
}

// Pattern: Connection Hook - initializes and verifies each physical session exactly once.
async function initializeClient(state, endpoint, client) {
  try {
    if (!endpoint.initializedClients.has(client)) {
      await initializeSessionSettings(client, endpoint.definition, state.databaseConfig.searchPath);
      endpoint.initializedClients.add(client);
      notifyObserver(state, state.observers.onSessionInitialized);
    }
    const roleState = await validateEndpointRole(client, endpoint);
    await validateReplicaReplay(state, endpoint, client, roleState);
    return attachClientPoolRole(client, endpoint.definition.role);
  } catch (error) {
    notifyObserver(state, state.observers.onSessionInitializationFailed, error);
    throw error;
  }
}

// Pattern: Session Policy - applies an identifier-validated search path and read-only guard.
async function initializeSessionSettings(client, definition, searchPath) {
  await client.query(`SET search_path TO ${searchPath.join(', ')}`);
  if (definition.readOnly) {
    await client.query('SET default_transaction_read_only = on');
  }
}

// Pattern: Fail-Closed Validation - rejects an endpoint serving the wrong PostgreSQL role.
async function validateEndpointRole(client, endpoint) {
  const result = await client.query('SELECT pg_is_in_recovery() AS in_recovery');
  const roleState = result?.rows?.[0];
  if (roleState?.in_recovery !== endpoint.definition.expectedInRecovery) {
    endpoint.roleValidationFailures += 1;
    throw createRoutingError('DATABASE_ROLE_MISMATCH', 'PostgreSQL endpoint role mismatch');
  }
  if (!roleState.in_recovery) {
    return roleState;
  }
  return loadReplicaReplayState(client, endpoint, roleState);
}

// Pattern: Recovery-Safe Probe - invokes replay-only functions only after recovery is confirmed.
async function loadReplicaReplayState(client, endpoint, roleState) {
  try {
    const result = await client.query(
      'SELECT pg_is_wal_replay_paused() AS replay_paused, ' +
        'pg_last_wal_replay_lsn()::text AS replay_lsn',
    );
    return { ...roleState, ...result?.rows?.[0] };
  } catch (error) {
    if (error?.code !== '55000') {
      throw error;
    }
    endpoint.roleValidationFailures += 1;
    throw createRoutingError('DATABASE_ROLE_MISMATCH', 'PostgreSQL endpoint role mismatch');
  }
}

// Pattern: Replica Safety Gate - rejects paused, uninitialized, or excessively lagging replay.
async function validateReplicaReplay(state, endpoint, client, roleState) {
  if (endpoint.definition.role !== REPLICA_READ_ROLE) {
    return;
  }
  if (roleState.replay_paused || !roleState.replay_lsn) {
    throw createRoutingError('DATABASE_REPLICA_REPLAY_UNAVAILABLE', 'Replica replay unavailable');
  }
  const primaryLsn = await getPrimaryWalLsn(state);
  const lagBytes = await calculateReplicaLag(client, primaryLsn, roleState.replay_lsn);
  if (lagBytes > state.databaseConfig.maxReplicaLagBytes) {
    throw createRoutingError('DATABASE_REPLICA_LAG', 'Replica lag exceeds safe threshold');
  }
}

// Pattern: Single-Flight Cache - bounds primary WAL probes shared by replica session initialization.
function getPrimaryWalLsn(state) {
  const cache = state.primaryLsnCache;
  if (cache.value && Date.now() < cache.expiresAt) {
    return Promise.resolve(cache.value);
  }
  if (!cache.promise) {
    cache.promise = loadPrimaryWalLsn(state).finally(() => {
      cache.promise = undefined;
    });
  }
  return cache.promise;
}

// Pattern: Primary Probe - reads one WAL location from the bounded fallback pool.
async function loadPrimaryWalLsn(state) {
  const client = await state.endpoints.primaryReadFallback.getClient();
  try {
    const result = await client.query('SELECT pg_current_wal_lsn()::text AS current_lsn');
    const currentLsn = result?.rows?.[0]?.current_lsn;
    if (!currentLsn) {
      throw createRoutingError(
        'DATABASE_PRIMARY_LSN_UNAVAILABLE',
        'Primary WAL position unavailable',
      );
    }
    state.primaryLsnCache.value = currentLsn;
    state.primaryLsnCache.expiresAt = Date.now() + PRIMARY_LSN_CACHE_MILLISECONDS;
    return currentLsn;
  } finally {
    client.release();
  }
}

// Pattern: Replica Measurement - compares replay and primary WAL locations on PostgreSQL.
async function calculateReplicaLag(client, primaryLsn, replayLsn) {
  const result = await client.query({
    text: 'SELECT pg_wal_lsn_diff($1::pg_lsn, $2::pg_lsn)::float8 AS lag_bytes',
    values: [primaryLsn, replayLsn],
  });
  const lagBytes = Number(result?.rows?.[0]?.lag_bytes);
  if (!Number.isFinite(lagBytes)) {
    throw createRoutingError('DATABASE_REPLICA_REPLAY_UNAVAILABLE', 'Replica lag unavailable');
  }
  return Math.max(0, lagBytes);
}

// Pattern: Metadata Adapter - identifies the acquired endpoint without exposing connection details.
function attachClientPoolRole(client, role) {
  client[CLIENT_POOL_ROLE] = role;
  return client;
}

// Pattern: Strategy - selects primary-only or replica-preferred acquisition from declared intent.
function getClientForCurrentContext(state) {
  if (state.databaseConfig.mode !== 'replica-preferred') {
    return state.endpoints.primaryWrite.getClient();
  }
  if (state.executionContext.getRole() !== REPLICA_READ_ROLE) {
    return state.endpoints.primaryWrite.getClient();
  }
  return getReplicaPreferredClient(state);
}

// Pattern: Circuit Breaker - permits one bounded replica attempt before controlled fallback.
async function getReplicaPreferredClient(state) {
  const decision = getCircuitDecision(state);
  if (decision !== 'attempt') {
    return getFallbackClient(state, 'circuit_open');
  }
  state.halfOpenProbeInProgress = state.circuitOpenUntil > 0;
  try {
    const client = await state.endpoints.replicaRead.getClient();
    closeReplicaCircuit(state);
    return client;
  } catch (error) {
    state.halfOpenProbeInProgress = false;
    if (!isFallbackEligibleError(error)) {
      throw error;
    }
    openReplicaCircuit(state);
    return getFallbackClient(state, getFallbackReason(error));
  }
}

// Pattern: Pure Decision - determines whether the replica circuit permits acquisition now.
function getCircuitDecision(state) {
  if (state.halfOpenProbeInProgress || Date.now() < state.circuitOpenUntil) {
    return 'fallback';
  }
  return 'attempt';
}

// Pattern: Circuit Transition - opens with exponential delay capped at thirty seconds.
function openReplicaCircuit(state) {
  state.circuitFailures += 1;
  const delay = Math.min(
    CIRCUIT_BASE_DELAY_MILLISECONDS * 2 ** (state.circuitFailures - 1),
    CIRCUIT_MAX_DELAY_MILLISECONDS,
  );
  state.circuitOpenUntil = Date.now() + delay;
}

// Pattern: Circuit Transition - resets only after a verified replica acquisition.
function closeReplicaCircuit(state) {
  state.circuitFailures = 0;
  state.circuitOpenUntil = 0;
  state.halfOpenProbeInProgress = false;
}

// Pattern: Allowlist - permits fallback only for known pre-dispatch availability failures.
function isFallbackEligibleError(error) {
  return (
    FALLBACK_ROUTING_ERROR_CODES.has(error?.code) ||
    TRANSIENT_DATABASE_ERROR_CODES.has(error?.code) ||
    error?.message === 'timeout exceeded when trying to connect'
  );
}

// Pattern: Low-Cardinality Classification - maps failures to bounded metric labels.
function getFallbackReason(error) {
  if (error?.code === 'DATABASE_ROLE_MISMATCH') {
    return 'role';
  }
  if (error?.code === 'DATABASE_REPLICA_LAG') {
    return 'lag';
  }
  if (
    String(error?.code).includes('REPLAY') ||
    error?.code === 'DATABASE_PRIMARY_LSN_UNAVAILABLE'
  ) {
    return 'replay';
  }
  return 'connect';
}

// Pattern: Controlled Degradation - acquires the read-only primary before query dispatch.
async function getFallbackClient(state, reason) {
  const client = await state.endpoints.primaryReadFallback.getClient();
  state.fallbackCounts[reason] += 1;
  notifyObserver(state, state.observers.onRoutingEvent, {
    event: 'primary_fallback',
    reason,
    role: 'primary-read-fallback',
    serviceName: state.databaseConfig.serviceName,
  });
  return client;
}

// Pattern: Complete Cleanup - closes every constructed pool and preserves all failures.
async function closeAllPools(endpoints) {
  const results = await Promise.allSettled(
    getEndpoints(endpoints).map(endpoint => endpoint.runtime.endPool()),
  );
  const failures = results
    .filter(result => result.status === 'rejected')
    .map(result => result.reason);
  if (failures.length === 1) {
    throw failures[0];
  }
  if (failures.length > 1) {
    throw new AggregateError(failures, 'PostgreSQL pool shutdown failed');
  }
}

// Pattern: Collection Adapter - returns only configured endpoint objects.
function getEndpoints(endpoints) {
  return Object.values(endpoints).filter(Boolean);
}

// Pattern: Query Accounting - records one logical user query against its acquired role.
function recordQuery(state, client) {
  const role = client?.[CLIENT_POOL_ROLE];
  if (!Object.hasOwn(state.queryCounts, role)) {
    throw new TypeError('PostgreSQL client pool role is unavailable');
  }
  state.queryCounts[role] += 1;
}

// Pattern: Staleness Accounting - records domain-detected stale replica results.
function recordStaleRead(state) {
  state.staleReadErrors += 1;
}

// Pattern: Metrics Facade - combines pool-role and routing metrics without sensitive labels.
function renderRouterMetrics(state) {
  const poolMetrics = getEndpoints(state.endpoints).map((endpoint, index) =>
    addPoolRoleLabel(endpoint.runtime.getPoolMetrics(), endpoint.definition.role, index === 0),
  );
  return poolMetrics.join('') + renderRoutingMetrics(state);
}

// Pattern: Metrics Adapter - adds one bounded role label and emits metadata once.
function addPoolRoleLabel(metrics, role, includeMetadata) {
  const lines = metrics.split('\n').filter(line => includeMetadata || !line.startsWith('#'));
  return `${lines
    .map(line =>
      line.replace(
        /^(?<metric>[^#{]+)\{service="(?<service>[^"]+)"/u,
        `$<metric>{service="$<service>",pool_role="${role}"`,
      ),
    )
    .join('\n')}\n`;
}

// Pattern: Metrics Projection - exposes bounded routing counters and circuit state.
function renderRoutingMetrics(state) {
  const label = `service="${state.databaseConfig.serviceName}"`;
  const lines = renderFallbackMetrics(state, label);
  lines.push(...renderQueryMetrics(state, label), ...renderSafetyMetrics(state, label));
  return `${lines.join('\n')}\n`;
}

// Pattern: Metrics Projection - exposes controlled primary fallback by bounded reason.
function renderFallbackMetrics(state, label) {
  const lines = [
    '# HELP carecard_postgres_read_fallback_total Replica reads served by primary fallback.',
    '# TYPE carecard_postgres_read_fallback_total counter',
  ];
  for (const reason of Object.keys(state.fallbackCounts)) {
    lines.push(
      `carecard_postgres_read_fallback_total{${label},reason="${reason}"} ${state.fallbackCounts[reason]}`,
    );
  }
  return lines;
}

// Pattern: Metrics Projection - reports logical queries by selected pool role.
function renderQueryMetrics(state, label) {
  const lines = [
    '# HELP carecard_postgres_queries_total Logical PostgreSQL queries by selected role.',
    '# TYPE carecard_postgres_queries_total counter',
  ];
  for (const [role, count] of Object.entries(state.queryCounts)) {
    lines.push(`carecard_postgres_queries_total{${label},pool_role="${role}"} ${count}`);
  }
  return lines;
}

// Pattern: Metrics Projection - reports role, circuit, and stale-read safety outcomes.
function renderSafetyMetrics(state, label) {
  const lines = [
    '# HELP carecard_postgres_replica_circuit_open Whether replica acquisition is circuit-broken.',
    '# TYPE carecard_postgres_replica_circuit_open gauge',
    `carecard_postgres_replica_circuit_open{${label}} ${Date.now() < state.circuitOpenUntil ? 1 : 0}`,
    '# HELP carecard_postgres_stale_read_errors_total Domain-detected stale replica reads.',
    '# TYPE carecard_postgres_stale_read_errors_total counter',
    `carecard_postgres_stale_read_errors_total{${label}} ${state.staleReadErrors}`,
    '# HELP carecard_postgres_role_validation_failures_total PostgreSQL endpoint role mismatches.',
    '# TYPE carecard_postgres_role_validation_failures_total counter',
    '# HELP carecard_postgres_routing_observer_failures_total Failed routing diagnostic observers.',
    '# TYPE carecard_postgres_routing_observer_failures_total counter',
    `carecard_postgres_routing_observer_failures_total{${label}} ${state.observerFailures}`,
  ];
  for (const endpoint of getEndpoints(state.endpoints)) {
    lines.push(
      `carecard_postgres_role_validation_failures_total{${label},pool_role="${endpoint.definition.role}"} ${endpoint.roleValidationFailures}`,
    );
  }
  return lines;
}

// Pattern: Readiness Composite - verifies the primary and declared read path.
async function checkDatabaseReadiness(state) {
  await verifyEndpointQuery(state.endpoints.primaryWrite);
  if (state.databaseConfig.mode === 'primary-only') {
    return { readFallbackActive: false };
  }
  const client = await getReplicaPreferredClient(state);
  const readFallbackActive = client[CLIENT_POOL_ROLE] === 'primary-read-fallback';
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }
  return { readFallbackActive };
}

// Pattern: Probe Operation - executes one bounded query on an exact endpoint.
async function verifyEndpointQuery(endpoint) {
  const client = await endpoint.getClient();
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }
}

// Pattern: Fault Isolation - records observer failures without changing database availability.
function notifyObserver(state, observer, ...values) {
  if (typeof observer !== 'function') {
    return;
  }
  try {
    observer(...values);
  } catch {
    state.observerFailures = (state.observerFailures ?? 0) + 1;
  }
}

// Pattern: Safe Error Factory - creates bounded internal routing failures.
function createRoutingError(code, message) {
  return Object.assign(new Error(message), { code });
}

// Pattern: Facade Factory - exposes the complete role-aware database boundary.
function createRouterFacade(state) {
  return {
    checkReadiness: () => checkDatabaseReadiness(state),
    endPools: () => closeAllPools(state.endpoints),
    forceCloseCheckedOutClients: () =>
      getEndpoints(state.endpoints).reduce(
        (total, endpoint) => total + endpoint.runtime.forceCloseCheckedOutClients(),
        0,
      ),
    getClient: () => getClientForCurrentContext(state),
    getPoolMetrics: () => renderRouterMetrics(state),
    pool: state.endpoints.primaryWrite.pool,
    recordQuery: client => recordQuery(state, client),
    recordStaleRead: () => recordStaleRead(state),
  };
}

module.exports = { createPostgresReadWriteRouter };
