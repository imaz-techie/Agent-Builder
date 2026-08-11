import crypto from "crypto";
import { userRepository } from "../repositories/user.repository";
import { authRepository } from "../repositories/auth.repository";
import { hashPassword, comparePassword } from "../utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { generateTotpSecret, verifyTotp, buildOtpauthUrl } from "../utils/totp";
import { ApiError } from "../utils/apiError";
import {
  RegisterDTO,
  LoginDTO,
  RequestMeta,
  UpdateProfileDTO,
  ChangePasswordDTO,
  AuthResponse,
  UserResponse,
} from "../interfaces/auth.interface";
import { User } from "@prisma/client";

function sanitizeUser(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isVerified: user.isVerified,
    twoFactorEnabled: user.twoFactorEnabled,
    createdAt: user.createdAt,
  };
}

function refreshTokenExpiry(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  return expiresAt;
}

export class AuthService {
  async register(dto: RegisterDTO, meta?: RequestMeta): Promise<AuthResponse> {
    const existingUser = await userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw ApiError.badRequest("User with this email already exists");
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await userRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
    });

    // Create default workspace for user
    const workspaceName = dto.workspaceName || `${dto.name}'s Workspace`;
    await authRepository.createInitialWorkspace(user.id, workspaceName);

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token in database (expires in 7 days)
    await authRepository.saveRefreshToken(
      user.id,
      refreshToken,
      refreshTokenExpiry(),
      meta?.ipAddress,
      meta?.userAgent
    );

    return {
      user: sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async login(dto: LoginDTO, meta?: RequestMeta): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(dto.email);
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const isMatch = await comparePassword(dto.password, user.passwordHash);
    if (!isMatch) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    if (user.twoFactorEnabled) {
      if (!dto.totpCode || !user.twoFactorSecret) {
        throw ApiError.unauthorized("Two-factor authentication code required");
      }
      if (!verifyTotp(user.twoFactorSecret, dto.totpCode)) {
        throw ApiError.unauthorized("Invalid or expired two-factor authentication code");
      }
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await authRepository.saveRefreshToken(
      user.id,
      refreshToken,
      refreshTokenExpiry(),
      meta?.ipAddress,
      meta?.userAgent
    );

    return {
      user: sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await authRepository.deleteRefreshToken(refreshToken);
  }

  async refreshTokens(token: string, meta?: RequestMeta): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      verifyRefreshToken(token);
      const storedToken = await authRepository.findRefreshToken(token);

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw ApiError.unauthorized("Invalid or expired refresh token");
      }

      // Rotate token: delete old, create new
      await authRepository.deleteRefreshToken(token);

      const user = storedToken.user;
      const newPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(newPayload);
      const newRefreshToken = generateRefreshToken(newPayload);

      await authRepository.saveRefreshToken(
        user.id,
        newRefreshToken,
        refreshTokenExpiry(),
        meta?.ipAddress || storedToken.ipAddress,
        meta?.userAgent || storedToken.userAgent
      );

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw ApiError.unauthorized("Invalid or expired refresh token");
    }
  }

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Return generic response to prevent email enumeration
      return { message: "If an account exists, a password reset link has been sent." };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await authRepository.createPasswordResetToken(user.id, resetToken, expiresAt);

    return {
      message: "If an account exists, a password reset link has been sent.",
      resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined,
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetRecord = await authRepository.findPasswordResetToken(token);
    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      throw ApiError.badRequest("Invalid or expired password reset token");
    }

    const newPasswordHash = await hashPassword(newPassword);
    await userRepository.updatePassword(resetRecord.userId, newPasswordHash);
    await authRepository.deletePasswordResetToken(token);
    await authRepository.deleteAllRefreshTokensForUser(resetRecord.userId);
  }

  async updateProfile(userId: string, dto: UpdateProfileDTO): Promise<UserResponse> {
    const user = await userRepository.updateProfile(userId, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl || null } : {}),
    });
    return sanitizeUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDTO): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const isMatch = await comparePassword(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw ApiError.badRequest("Current password is incorrect");
    }

    if (dto.currentPassword === dto.newPassword) {
      throw ApiError.badRequest("New password must be different from the current password");
    }

    const newPasswordHash = await hashPassword(dto.newPassword);
    await userRepository.updatePassword(userId, newPasswordHash);
    // Terminate all active sessions so the user must re-authenticate
    await authRepository.deleteAllRefreshTokensForUser(userId);
  }

  async enableTwoFactor(userId: string, password: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (user.twoFactorEnabled) {
      throw ApiError.badRequest("Two-factor authentication is already enabled");
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw ApiError.badRequest("Password is incorrect");
    }

    const secret = generateTotpSecret();
    await userRepository.setTwoFactorSecret(userId, secret);

    return {
      secret,
      otpauthUrl: buildOtpauthUrl(secret, user.email),
    };
  }

  async confirmTwoFactor(userId: string, totpCode: string): Promise<UserResponse> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (user.twoFactorEnabled) {
      throw ApiError.badRequest("Two-factor authentication is already enabled");
    }

    if (!user.twoFactorSecret) {
      throw ApiError.badRequest("No pending two-factor setup found. Enable it first.");
    }

    if (!verifyTotp(user.twoFactorSecret, totpCode)) {
      throw ApiError.badRequest("Invalid two-factor authentication code");
    }

    const updated = await userRepository.enableTwoFactor(userId);
    return sanitizeUser(updated);
  }

  async disableTwoFactor(userId: string, totpCode: string): Promise<UserResponse> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw ApiError.badRequest("Two-factor authentication is not enabled");
    }

    if (!verifyTotp(user.twoFactorSecret, totpCode)) {
      throw ApiError.badRequest("Invalid two-factor authentication code");
    }

    const updated = await userRepository.disableTwoFactor(userId);
    return sanitizeUser(updated);
  }

  async getSessions(userId: string) {
    const sessions = await authRepository.listSessionsForUser(userId);
    return sessions.map((session) => ({
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
    }));
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await authRepository.findSessionById(sessionId, userId);
    if (!session) {
      throw ApiError.notFound("Session not found");
    }
    await authRepository.deleteSessionById(sessionId, userId);
  }

  async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return sanitizeUser(user);
  }
}

export const authService = new AuthService();
