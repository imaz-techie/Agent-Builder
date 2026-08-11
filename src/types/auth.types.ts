export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  workspaceId?: string;
  isVerified: boolean;
  twoFactorEnabled: boolean;
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
  totpCode?: string;
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

export interface UpdateProfileDto {
  name?: string;
  avatarUrl?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface AuthSession {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface TwoFactorEnableResponse {
  secret: string;
  otpauthUrl: string;
}

