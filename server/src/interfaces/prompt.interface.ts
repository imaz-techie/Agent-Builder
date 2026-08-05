import { LlmModel } from "@prisma/client";

export interface CreatePromptTemplateDTO {
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

export interface UpdatePromptTemplateDTO {
  title?: string;
  description?: string;
  category?: string;
  systemPrompt?: string;
  userPromptTemplate?: string;
  model?: LlmModel;
  temperature?: number;
  maxTokens?: number;
  isPublic?: boolean;
}

export interface ExecutePromptDTO {
  templateId?: string;
  agentId?: string;
  systemPrompt?: string;
  userPrompt: string;
  variables?: Record<string, string>;
  model?: LlmModel;
  temperature?: number;
  maxTokens?: number;
}

export interface ComparePromptsDTO {
  userPrompt: string;
  variables?: Record<string, string>;
  configs: Array<{
    name: string;
    systemPrompt?: string;
    model: LlmModel;
    temperature?: number;
  }>;
}

export interface PromptTemplateResponse {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptExecutionResponse {
  id: string;
  templateId: string | null;
  agentId: string | null;
  systemPrompt: string;
  userPrompt: string;
  variablesUsed: Record<string, unknown> | null;
  model: LlmModel;
  outputContent: string;
  latencyMs: number;
  tokensUsed: number;
  workspaceId: string;
  createdById: string;
  createdAt: Date;
}
