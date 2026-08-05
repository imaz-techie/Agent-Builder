export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  workspaceId?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  agreeToTerms?: boolean;
}

export interface ForgotPasswordDto {
  email: string;
}
