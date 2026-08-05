import { prisma } from "../database";
import { RefreshToken, PasswordResetToken } from "@prisma/client";

export class AuthRepository {
  async saveRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  async deleteAllRefreshTokensForUser(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async createPasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<PasswordResetToken> {
    // Invalidate previous reset tokens for user
    await prisma.passwordResetToken.deleteMany({ where: { userId } });

    return prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
    return prisma.passwordResetToken.findUnique({
      where: { token },
    });
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await prisma.passwordResetToken.deleteMany({
      where: { token },
    });
  }

  async createInitialWorkspace(userId: string, name: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now();
    return prisma.workspace.create({
      data: {
        name,
        slug,
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
    });
  }
}

export const authRepository = new AuthRepository();
