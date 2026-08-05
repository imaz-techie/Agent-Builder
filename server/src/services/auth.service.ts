import crypto from "crypto";
import { userRepository } from "../repositories/user.repository";
import { authRepository } from "../repositories/auth.repository";
import { hashPassword, comparePassword } from "../utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { ApiError } from "../utils/apiError";
import {
  RegisterDTO,
  LoginDTO,
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
    createdAt: user.createdAt,
  };
}

export class AuthService {
  async register(dto: RegisterDTO): Promise<AuthResponse> {
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
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await authRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    return {
      user: sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async login(dto: LoginDTO): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(dto.email);
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const isMatch = await comparePassword(dto.password, user.passwordHash);
    if (!isMatch) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await authRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

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

  async refreshTokens(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = verifyRefreshToken(token);
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

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await authRepository.saveRefreshToken(user.id, newRefreshToken, expiresAt);

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

  async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return sanitizeUser(user);
  }
}

export const authService = new AuthService();
