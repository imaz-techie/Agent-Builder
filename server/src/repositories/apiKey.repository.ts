import { prisma } from "../database";
import { ApiKeyPermission } from "@prisma/client";

export class ApiKeyRepository {
  async createApiKey(data: {
    name: string;
    keyPrefix: string;
    keyHash: string;
    workspaceId: string;
    createdById: string;
    permissions?: ApiKeyPermission[];
    expiresAt?: Date;
  }) {
    return prisma.apiKey.create({
      data: {
        name: data.name,
        keyPrefix: data.keyPrefix,
        keyHash: data.keyHash,
        workspaceId: data.workspaceId,
        createdById: data.createdById,
        permissions: data.permissions || [ApiKeyPermission.READ],
        expiresAt: data.expiresAt || null,
      },
    });
  }

  async findApiKeysByWorkspaceId(workspaceId: string) {
    return prisma.apiKey.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findApiKeyByHash(keyHash: string) {
    return prisma.apiKey.findUnique({
      where: { keyHash },
      include: { workspace: true, createdBy: true },
    });
  }

  async updateLastUsedAt(id: string) {
    return prisma.apiKey.update({
      where: { id },
      data: { lastUsedAt: new Date() },
    });
  }

  async deleteApiKey(id: string, workspaceId: string) {
    return prisma.apiKey.deleteMany({
      where: { id, workspaceId },
    });
  }
}

export const apiKeyRepository = new ApiKeyRepository();
