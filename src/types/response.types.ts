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
  version: string;
  service: string;
  environment: string;
  timestamp: string;
  requestId: string;
  traceId: string;
  client?: {
    appId?: string;
    ip?: string;
  };
  pagination?: ApiPagination;
  [key: string]: any;
}

/**
 * Standard API error object.
 */
export interface ApiError {
  code: string;
  details?: string;
  message?: string;
  fields?: Record<string, string>;
}

/**
 * Standard API response body.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  error: ApiError | null;
  meta: ApiResponseMeta;
}

/**
 * Parameters for sendResponse utility.
 */
export interface SendResponseParams<T = any> {
  req: any;
  res: any;
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
