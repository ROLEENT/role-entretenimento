/**
 * API Types
 * 
 * Type definitions for API requests, responses, and error handling.
 */

// ========== Base API Types ==========

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
}

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  errors?: ApiValidationError[];
  meta?: ApiMeta;
  timestamp: string;
  requestId?: string;
}

export interface ApiMeta {
  pagination?: PaginationMeta;
  filters?: Record<string, unknown>;
  sort?: SortMeta;
  total?: number;
  count?: number;
  timing?: {
    request: number;
    processing: number;
    total: number;
  };
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SortMeta {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ApiValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
  timestamp?: string;
  requestId?: string;
  isNetworkError?: boolean;
  isTimeoutError?: boolean;
  isValidationError?: boolean;
}

// ========== Request/Response Types ==========

export interface ListRequest {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, unknown>;
  include?: string[];
}

export interface ListResponse<T> {
  items: T[];
  pagination: PaginationMeta;
  filters?: Record<string, unknown>;
  facets?: Record<string, Array<{ value: string; count: number }>>;
}

export interface CreateRequest<T> {
  data: Omit<T, 'id' | 'created_at' | 'updated_at'>;
}

export interface UpdateRequest<T> {
  id: string;
  data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>;
}

export interface DeleteRequest {
  id: string;
  cascade?: boolean;
}

export interface BulkRequest<T> {
  items: T[];
  operation: 'create' | 'update' | 'delete';
}

export interface BulkResponse<T> {
  success: T[];
  failed: Array<{
    item: T;
    error: string;
  }>;
  summary: {
    total: number;
    succeeded: number;
    failed: number;
  };
}

// ========== Event API Types ==========

export interface EventsListRequest extends ListRequest {
  city?: string;
  category?: string[];
  date_from?: string;
  date_to?: string;
  price_min?: number;
  price_max?: number;
  status?: string[];
  featured?: boolean;
}

export interface EventCreateRequest {
  title: string;
  description?: string;
  date_start: string;
  date_end?: string;
  location: string;
  city: string;
  state: string;
  country: string;
  organizer_id?: string;
  venue_id?: string;
  category_ids?: string[];
  price_min?: number;
  price_max?: number;
  image_url?: string;
  status?: 'draft' | 'published';
}

export interface EventUpdateRequest {
  title?: string;
  description?: string;
  date_start?: string;
  date_end?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  organizer_id?: string;
  venue_id?: string;
  category_ids?: string[];
  price_min?: number;
  price_max?: number;
  image_url?: string;
  status?: 'draft' | 'published' | 'cancelled';
}

// ========== User API Types ==========

export interface AuthLoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface AuthRegisterRequest {
  email: string;
  password: string;
  name?: string;
  terms_accepted: boolean;
  marketing_consent?: boolean;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
    avatar_url?: string;
  };
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordUpdateRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ProfileUpdateRequest {
  name?: string;
  avatar_url?: string;
  preferences?: Record<string, unknown>;
}

// ========== File Upload Types ==========

export interface FileUploadRequest {
  file: File;
  directory?: string;
  public?: boolean;
  transform?: {
    resize?: { width: number; height: number };
    format?: 'jpeg' | 'png' | 'webp';
    quality?: number;
  };
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  public_url?: string;
  thumbnail_url?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
  };
}

// ========== Search API Types ==========

export interface SearchRequest {
  query: string;
  type?: 'events' | 'venues' | 'artists' | 'all';
  filters?: Record<string, unknown>;
  location?: {
    latitude: number;
    longitude: number;
    radius?: number;
  };
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  query: string;
  results: {
    events?: SearchEventResult[];
    venues?: SearchVenueResult[];
    artists?: SearchArtistResult[];
  };
  total: number;
  facets?: Record<string, Array<{ value: string; count: number }>>;
  suggestions?: string[];
  timing: {
    query_time: number;
    total_time: number;
  };
}

export interface SearchEventResult {
  id: string;
  title: string;
  date_start: string;
  city: string;
  venue_name?: string;
  image_url?: string;
  score: number;
  highlight?: {
    title?: string[];
    description?: string[];
  };
}

export interface SearchVenueResult {
  id: string;
  name: string;
  address: string;
  city: string;
  capacity?: number;
  image_url?: string;
  score: number;
}

export interface SearchArtistResult {
  id: string;
  name: string;
  genre?: string[];
  city?: string;
  image_url?: string;
  score: number;
}

// ========== Analytics API Types ==========

export interface AnalyticsRequest {
  start_date: string;
  end_date: string;
  granularity?: 'hour' | 'day' | 'week' | 'month';
  metrics?: string[];
  dimensions?: string[];
  filters?: Record<string, unknown>;
}

export interface AnalyticsResponse {
  data: Array<{
    date: string;
    metrics: Record<string, number>;
    dimensions?: Record<string, string>;
  }>;
  summary: Record<string, number>;
  period: {
    start: string;
    end: string;
    granularity: string;
  };
}

// ========== Webhook Types ==========

export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
  source: string;
  version: string;
}

export interface WebhookResponse {
  received: boolean;
  processed: boolean;
  message?: string;
  errors?: string[];
}

// ========== Rate Limiting Types ==========

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  resetTime: Date;
}

// ========== API Client Configuration ==========

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  apiKey?: string;
  authToken?: string;
  userAgent?: string;
  headers?: Record<string, string>;
  interceptors?: {
    request?: (config: ApiRequestConfig) => ApiRequestConfig;
    response?: (response: ApiResponse) => ApiResponse;
    error?: (error: ApiError) => Promise<never>;
  };
}