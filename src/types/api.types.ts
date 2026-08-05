export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  stack?: string;
  errors?: Record<string, string[]>;
}
