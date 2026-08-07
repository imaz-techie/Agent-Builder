export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  stack?: string;
  errors?: Record<string, string[]>;
}
