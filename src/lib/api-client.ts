/**
 * Agent Builder API Client with Feature Flag & Fallback Support
 * 
 * VITE_USE_API=true  -> Fetches from Express Backend REST API
 * VITE_USE_API=false -> Uses local mock data in mock-data.ts
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export const USE_API = import.meta.env.VITE_USE_API === "true";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: Record<string, unknown>;
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "API Request Failed");
  }

  return data as ApiResponse<T>;
}
