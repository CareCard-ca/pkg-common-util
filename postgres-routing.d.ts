export type PostgresPoolRole = 'primary-read-fallback' | 'primary-write' | 'replica-read';
export type PostgresRoutingMode = 'primary-only' | 'replica-preferred';

export interface PostgresQueryConfig {
  text: string;
  values?: unknown[];
}

export interface PostgresQueryResult<
  Row extends Record<string, unknown> = Record<string, unknown>,
> {
  rows: Row[];
}

export interface PostgresClientLike {
  query<Row extends Record<string, unknown> = Record<string, unknown>>(
    query: PostgresQueryConfig | string,
  ): Promise<PostgresQueryResult<Row>>;
  release(destroy?: boolean): unknown;
}

export interface PostgresPoolLike<Client extends PostgresClientLike = PostgresClientLike> {
  readonly idleCount: number;
  readonly totalCount: number;
  readonly waitingCount: number;
  connect(): Promise<Client>;
  end(): Promise<unknown>;
  on(event: 'connect', listener: (client: Client) => void): unknown;
  on(event: 'error', listener: (error: unknown) => void): unknown;
  on(event: 'remove', listener: () => void): unknown;
}

export interface PostgresConnectionConfig {
  application_name: string;
  host?: string;
  max: number;
  [key: string]: unknown;
}

export interface PostgresPoolDefinition {
  connectionConfig: PostgresConnectionConfig;
  expectedInRecovery: boolean;
  readOnly: boolean;
  role: PostgresPoolRole;
}

export interface PostgresRoutingConfig {
  maxReplicaLagBytes: number;
  mode: PostgresRoutingMode;
  primaryReadFallback?: PostgresPoolDefinition;
  primaryWrite: PostgresPoolDefinition;
  replicaRead?: PostgresPoolDefinition;
  searchPath: string[];
  serviceName: string;
}

export interface CreatePostgresRoutingConfigOptions {
  databaseJob?: boolean;
  maxReplicaLagBytes?: number;
  mode: PostgresRoutingMode;
  poolMaximum?: number;
  primaryConnectionConfig: PostgresConnectionConfig;
  readHost?: string;
  searchPath: string[];
  serviceName: string;
}

export interface DatabaseExecutionContext {
  getRole(): 'primary-write' | 'replica-read';
  markPrimaryRequired(): void;
  runPrimaryWrite<Result>(operation: () => Result): Result;
  runReplicaRead<Result>(operation: () => Result): Result;
}

export interface PostgresRoutingEvent {
  event: 'primary_fallback';
  reason: 'circuit_open' | 'connect' | 'lag' | 'replay' | 'role';
  role: 'primary-read-fallback';
  serviceName: string;
}

export interface PostgresRoutingObservers<Client extends PostgresClientLike> {
  onConnect?(client: Client): void;
  onPoolError?(error: unknown): void;
  onRemove?(): void;
  onRoutingEvent?(event: PostgresRoutingEvent): void;
  onSessionInitializationFailed?(error: unknown): void;
  onSessionInitialized?(): void;
}

export interface CreatePostgresReadWriteRouterOptions<
  Client extends PostgresClientLike,
  Pool extends PostgresPoolLike<Client>,
> {
  createPool(connectionConfig: PostgresConnectionConfig): Pool;
  databaseConfig: PostgresRoutingConfig;
  executionContext: DatabaseExecutionContext;
  markError?(error: unknown): unknown;
  observers?: PostgresRoutingObservers<Client>;
}

export interface PostgresReadWriteRouter<Client extends PostgresClientLike, Pool> {
  checkReadiness(): Promise<{ readFallbackActive: boolean }>;
  endPools(): Promise<void>;
  forceCloseCheckedOutClients(): number;
  getClient(): Promise<Client>;
  getPoolMetrics(): string;
  pool: Pool;
  recordQuery(client: Client): void;
  recordStaleRead(): void;
}

export interface CreatePostgresPoolRuntimeOptions<
  Client extends PostgresClientLike,
  Pool extends PostgresPoolLike<Client>,
> {
  markError?(error: unknown): unknown;
  maximum: number;
  onConnect?(client: Client): void;
  onPoolError?(error: unknown): void;
  onRemove?(): void;
  pool: Pool;
  serviceName: string;
}

export interface PostgresPoolRuntime<Client extends PostgresClientLike> {
  connect(initializeClient: (client: Client) => Client | Promise<Client>): Promise<Client>;
  endPool(): Promise<unknown>;
  forceCloseCheckedOutClients(): number;
  getPoolMetrics(): string;
  recordListenerError(error: unknown): void;
  recordListenerReconnectAttempt(): void;
  setListenerConnected(connected: boolean): void;
}

export function createDatabaseExecutionContext(): DatabaseExecutionContext;
export function createPostgresPoolRuntime<
  Client extends PostgresClientLike,
  Pool extends PostgresPoolLike<Client>,
>(options: CreatePostgresPoolRuntimeOptions<Client, Pool>): PostgresPoolRuntime<Client>;
export function createPostgresReadWriteRouter<
  Client extends PostgresClientLike,
  Pool extends PostgresPoolLike<Client>,
>(
  options: CreatePostgresReadWriteRouterOptions<Client, Pool>,
): PostgresReadWriteRouter<Client, Pool>;
export function createPostgresRoutingConfig(
  options: CreatePostgresRoutingConfigOptions,
): PostgresRoutingConfig;

declare const postgresRouting: {
  createDatabaseExecutionContext: typeof createDatabaseExecutionContext;
  createPostgresPoolRuntime: typeof createPostgresPoolRuntime;
  createPostgresReadWriteRouter: typeof createPostgresReadWriteRouter;
  createPostgresRoutingConfig: typeof createPostgresRoutingConfig;
};

export default postgresRouting;
