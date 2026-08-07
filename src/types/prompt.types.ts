import type { LlmModel } from "@/types/agent.types";

export interface PromptTemplate {
  id: string;
  title: string;
  description: string | null;
  category: string;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
  model: LlmModel;
  temperature: number;
  maxTokens: number;
  isPublic: boolean;
  workspaceId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromptTemplateDto {
  title: string;
  description?: string;
  category?: string;
  systemPrompt?: string;
  userPromptTemplate: string;
  model?: LlmModel;
  temperature?: number;
  maxTokens?: number;
  isPublic?: boolean;
}

export type UpdatePromptTemplateDto = Partial<CreatePromptTemplateDto>;

export interface PromptExecution {
  id: string;
  templateId: string | null;
  agentId: string | null;
  systemPrompt: string;
  userPrompt: string;
  variablesUsed: Record<string, string> | null;
  model: LlmModel;
  outputContent: string;
  latencyMs: number;
  tokensUsed: number;
  workspaceId: string;
  createdById: string;
  createdAt: string;
}

export interface ExecutePromptDto {
  templateId?: string;
  agentId?: string;
  systemPrompt?: string;
  userPrompt: string;
  variables?: Record<string, string>;
  model?: LlmModel;
  temperature?: number;
  maxTokens?: number;
}

export interface ComparePromptConfig {
  name: string;
  systemPrompt?: string;
  model: LlmModel;
  temperature?: number;
}

export interface ComparePromptsDto {
  userPrompt: string;
  variables?: Record<string, string>;
  configs: ComparePromptConfig[];
}

export interface PromptComparisonResult {
  configName: string;
  model: LlmModel;
  executionId: string;
  outputContent: string;
  latencyMs: number;
  tokensUsed: number;
}
