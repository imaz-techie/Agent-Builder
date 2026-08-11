import { prisma } from "../database";
import { Role, User } from "@prisma/client";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role?: Role;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role || Role.DEVELOPER,
      },
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async updateProfile(
    id: string,
    data: { name?: string; avatarUrl?: string | null }
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
      },
    });
  }

  async setTwoFactorSecret(id: string, secret: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { twoFactorSecret: secret, twoFactorEnabled: false },
    });
  }

  async enableTwoFactor(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { twoFactorEnabled: true },
    });
  }

  async disableTwoFactor(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });
  }

  async updateRole(id: string, role: Role): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { role },
    });
  }
}

export const userRepository = new UserRepository();
