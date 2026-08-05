import { prisma } from "../database";
import { ProviderType } from "@prisma/client";

export class LLMProviderRepository {
  async saveProviderConfig(data: {
    provider: ProviderType;
    apiKeyMasked: string;
    apiKeyEncrypted: string;
    baseUrl?: string;
    isDefault?: boolean;
    priority?: number;
    workspaceId: string;
    createdById: string;
  }) {
    return prisma.llmProviderConfig.upsert({
      where: {
        workspaceId_provider: {
          workspaceId: data.workspaceId,
          provider: data.provider,
        },
      },
      update: {
        apiKeyMasked: data.apiKeyMasked,
        apiKeyEncrypted: data.apiKeyEncrypted,
        baseUrl: data.baseUrl || null,
        isDefault: data.isDefault ?? false,
        priority: data.priority ?? 1,
        isEnabled: true,
      },
      create: {
        provider: data.provider,
        apiKeyMasked: data.apiKeyMasked,
        apiKeyEncrypted: data.apiKeyEncrypted,
        baseUrl: data.baseUrl || null,
        isDefault: data.isDefault ?? false,
        priority: data.priority ?? 1,
        isEnabled: true,
        workspaceId: data.workspaceId,
        createdById: data.createdById,
      },
    });
  }

  async findConfigsByWorkspace(workspaceId: string) {
    return prisma.llmProviderConfig.findMany({
      where: { workspaceId },
      orderBy: { priority: "asc" },
    });
  }

  async findActiveProvidersOrderedByPriority(workspaceId: string) {
    return prisma.llmProviderConfig.findMany({
      where: { workspaceId, isEnabled: true },
      orderBy: { priority: "asc" },
    });
  }

  async deleteProviderConfig(id: string, workspaceId: string) {
    return prisma.llmProviderConfig.deleteMany({
      where: { id, workspaceId },
    });
  }
}

export const llmProviderRepository = new LLMProviderRepository();
