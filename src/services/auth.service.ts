import { apiClient } from "@/api/axios";
import { API_ENDPOINTS, STORAGE_KEYS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  ForgotPasswordDto,
} from "@/types/auth.types";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    const authData = response.data.data;
    if (authData?.tokens) {
      sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.tokens.accessToken);
      sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.tokens.refreshToken);
      sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authData.user));
    }
    return authData;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.REGISTER,
      credentials
    );
    const authData = response.data.data;
    if (authData?.tokens) {
      sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.tokens.accessToken);
      sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.tokens.refreshToken);
      sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authData.user));
    }
    return authData;
  },

  async logout(): Promise<void> {
    const refreshToken = sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    try {
      if (refreshToken) {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
      }
    } finally {
      sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.AUTH.ME
    );
    return response.data.data;
  },

  async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      data
    );
    return response.data;
  },
};
