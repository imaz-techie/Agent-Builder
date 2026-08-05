import { LlmModel, ProviderType } from "@prisma/client";

export interface LLMCompletionOptions {
  model: LlmModel;
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

export interface LLMCompletionResponse {
  provider: ProviderType;
  model: LlmModel;
  content: string;
  tokensUsed: number;
  latencyMs: number;
}

export interface ConfigureProviderDTO {
  provider: ProviderType;
  apiKey: string;
  baseUrl?: string;
  isDefault?: boolean;
  priority?: number;
}

export interface ProviderConfigResponse {
  id: string;
  provider: ProviderType;
  apiKeyMasked: string | null;
  baseUrl: string | null;
  isDefault: boolean;
  isEnabled: boolean;
  priority: number;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}
