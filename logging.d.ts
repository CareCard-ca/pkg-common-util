export type LogLevel = 'debug' | 'error' | 'info' | 'warn';
export type LogDestination = 'stderr' | 'stdout';
export type LogContext = Record<string, unknown>;

export interface SerializedLogError {
  cause?: SerializedLogError | unknown;
  code?: unknown;
  message?: string;
  name?: string;
  stack?: string;
  [key: string]: unknown;
}

export interface ApplicationLogHttp {
  durationMs?: number;
  method?: string;
  route?: string;
  statusCode?: number;
}

export interface ApplicationLogRecord {
  actorIdHash?: string;
  context?: LogContext;
  environment: string;
  error?: SerializedLogError | unknown;
  http?: ApplicationLogHttp;
  level: LogLevel;
  message: string;
  operation: string;
  requestId?: string;
  schemaVersion: 1;
  service: string;
  serviceVersion: string;
  spanId?: string;
  timestamp: string;
  traceId?: string;
}

export type ApplicationLogSink = (
  destination: LogDestination,
  line: string,
  record: ApplicationLogRecord,
) => void;

export interface TraceMetadataProviderResult {
  spanId?: string;
  traceId?: string;
}

export interface CreateApplicationLoggerOptions {
  environment?: string;
  fileMaxBytes?: number;
  filePath?: string;
  fileRetentionCount?: number;
  identityHmacKey?: string;
  minimumLevel?: LogLevel;
  now?: () => Date;
  service: string;
  serviceVersion?: string;
  sink?: ApplicationLogSink;
  traceMetadataProvider?: () => TraceMetadataProviderResult;
  writeToConsole?: boolean;
}

export interface LogHttpRequest {
  baseUrl?: string;
  jwt?: { payload?: { sub?: string } | null } | null;
  method?: string;
  originalUrl?: string;
  path?: string;
  requestId?: string;
  res?: { statusCode?: number };
  route?: { path?: string };
  traceId?: string;
  url?: string;
}

export interface LogHttpResponse {
  statusCode: number;
  once(event: 'finish', listener: () => void): unknown;
}

export interface ApplicationLogger {
  debug(message: unknown, metadata?: unknown): void;
  error(message: unknown, metadata?: unknown): void;
  getRequestMetadata(request: LogHttpRequest, metadata?: LogContext): LogContext;
  httpLogger(): HttpRequestLogger;
  info(message: unknown, metadata?: unknown): void;
  redactSensitiveMetadata(value: unknown): unknown;
  stream: { write(message: unknown): void };
  warn(message: unknown, metadata?: unknown): void;
}

export type HttpRequestLogger = (
  request: LogHttpRequest,
  response: LogHttpResponse,
  next: () => void,
) => void;

export interface CreateHttpRequestLoggerOptions {
  nowMilliseconds?: () => number;
}

export interface FatalProcessTarget {
  off(event: 'uncaughtExceptionMonitor', listener: FatalProcessListener): unknown;
  on(event: 'uncaughtExceptionMonitor', listener: FatalProcessListener): unknown;
}

export type FatalProcessListener = (error: unknown, origin: string) => void;

export interface InstallFatalProcessLoggingOptions {
  processTarget?: FatalProcessTarget;
}

export function createApplicationLogger(options: CreateApplicationLoggerOptions): ApplicationLogger;
export function createHttpRequestLogger(
  logger: ApplicationLogger,
  options?: CreateHttpRequestLoggerOptions,
): HttpRequestLogger;
export function installFatalProcessLogging(
  logger: ApplicationLogger,
  options?: InstallFatalProcessLoggingOptions,
): () => void;

declare const logging: {
  createApplicationLogger: typeof createApplicationLogger;
  createHttpRequestLogger: typeof createHttpRequestLogger;
  installFatalProcessLogging: typeof installFatalProcessLogging;
};

export default logging;
