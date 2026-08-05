/**
 * Pagination information
 */
export interface ApiPagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Standard API response metadata.
 */
export interface ApiResponseMeta {
  version?: string;
  service?: string;
  environment?: string;
  timestamp?: string;
  requestId?: string;
  traceId?: string;
  client?: {
    appId?: string;
    ip?: string;
  };
  pagination?: ApiPagination | null;
  [key: string]: unknown;
}

/**
 * Standard API error object.
 */
export interface ApiError {
  code?: string;
  details?: string;
  message?: string;
  fields?: Record<string, string>;
}

/**
 * Standard API response body.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  error?: ApiError | null;
  meta?: ApiResponseMeta;
}

export interface ApiRequestContext {
  requestId?: string;
  traceId?: string;
  client?: Record<string, unknown>;
}

export interface ApiResponseWriter {
  status(statusCode: number): ApiResponseWriter;
  json(body: unknown): unknown;
  send(body?: unknown): unknown;
}

/**
 * Parameters for sendResponse utility.
 */
export interface SendResponseParams<T = unknown> {
  req: ApiRequestContext;
  res: ApiResponseWriter;
  statusCode?: number;
  success?: boolean;
  message?: string;
  data?: T | null;
  error?: ApiError | null;
  meta?: Partial<ApiResponseMeta>;
}

/**
 * Parameters for createError utility.
 */
export interface CreateErrorParams {
  code: string;
  details?: string;
  message?: string;
  fields?: Record<string, string>;
}
