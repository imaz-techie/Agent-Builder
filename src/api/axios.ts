import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { API_BASE_URL, STORAGE_KEYS, API_ENDPOINTS } from "@/constants/api.constants";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Inject bearer token from sessionStorage
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling & Refresh Token Support
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized with Refresh Token logic
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes(API_ENDPOINTS.AUTH.LOGIN) || originalRequest.url?.includes(API_ENDPOINTS.AUTH.REFRESH)) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      const refreshToken = sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data || response.data;
          sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          if (newRefreshToken) {
            sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
          }

          processQueue(null, accessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }
    }

    // Global Error Toast Notice
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected API error occurred.";

    if (error.response?.status !== 401) {
      toast.error("API Request Failed", {
        description: errorMessage,
      });
    }

    return Promise.reject(error);
  }
);
