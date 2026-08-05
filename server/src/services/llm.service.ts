import { llmProviderRepository } from "../repositories/llmProvider.repository";
import { workspaceRepository } from "../repositories/workspace.repository";
import { LLMProviderFactory } from "../providers/LLMProviderFactory";
import {
  LLMCompletionOptions,
  ConfigureProviderDTO,
} from "../interfaces/llm.interface";
import { ApiError } from "../utils/apiError";
import { ProviderType } from "@prisma/client";

function maskApiKey(key: string): string {
  if (key.length <= 8) return "********";
  return key.substring(0, 4) + "..." + key.substring(key.length - 4);
}

export class LLMService {
  async configureProvider(workspaceId: string, userId: string, dto: ConfigureProviderDTO) {
    const apiKeyMasked = maskApiKey(dto.apiKey);
    // Simple base64 encoding simulation for encrypted storage
    const apiKeyEncrypted = Buffer.from(dto.apiKey).toString("base64");

    const config = await llmProviderRepository.saveProviderConfig({
      provider: dto.provider,
      apiKeyMasked,
      apiKeyEncrypted,
      baseUrl: dto.baseUrl,
      isDefault: dto.isDefault,
      priority: dto.priority,
      workspaceId,
      createdById: userId,
    });

    await workspaceRepository.logAuditAction(userId, workspaceId, "LLM_PROVIDER_CONFIGURED", {
      provider: dto.provider,
    });

    return config;
  }

  async getWorkspaceProviders(workspaceId: string) {
    return llmProviderRepository.findConfigsByWorkspace(workspaceId);
  }

  async generateCompletion(workspaceId: string, options: LLMCompletionOptions) {
    const activeConfigs = await llmProviderRepository.findActiveProvidersOrderedByPriority(
      workspaceId
    );

    const providerChain = activeConfigs.map((c) => ({
      type: c.provider,
      apiKey: c.apiKeyEncrypted ? Buffer.from(c.apiKeyEncrypted, "base64").toString("utf-8") : undefined,
      baseUrl: c.baseUrl || undefined,
    }));

    return LLMProviderFactory.executeWithFallback(providerChain, options);
  }

  async streamCompletion(
    workspaceId: string,
    options: LLMCompletionOptions,
    onChunk: (chunk: string) => void
  ) {
    const activeConfigs = await llmProviderRepository.findActiveProvidersOrderedByPriority(
      workspaceId
    );

    const primaryType = activeConfigs.length > 0 ? activeConfigs[0].provider : ProviderType.OPENAI;
    const provider = LLMProviderFactory.getProvider(primaryType);

    return provider.streamCompletion(options, onChunk);
  }

  async testProviderConnection(providerId: string, workspaceId: string) {
    const configs = await llmProviderRepository.findConfigsByWorkspace(workspaceId);
    const target = configs.find((c) => c.id === providerId);

    if (!target) {
      throw ApiError.notFound("Provider configuration not found in this workspace");
    }

    const provider = LLMProviderFactory.getProvider(target.provider);
    const isHealthy = await provider.testConnection();

    return { healthy: isHealthy, provider: target.provider };
  }
}

export const llmService = new LLMService();
