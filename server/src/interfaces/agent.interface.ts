import { AgentStatus, LlmModel } from "@prisma/client";

export interface CreateAgentDTO {
  name: string;
  description: string;
  category?: string;
  tags?: string[];
  status?: AgentStatus;
  model?: LlmModel;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  avatarColor?: string;
}

export interface UpdateAgentDTO {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  status?: AgentStatus;
  model?: LlmModel;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  avatarColor?: string;
  changelog?: string;
}

export interface CloneAgentDTO {
  name?: string;
}

export interface AgentQueryParams {
  search?: string;
  category?: string;
  status?: AgentStatus;
  page?: string;
  limit?: string;
}

export interface AgentResponse {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  status: AgentStatus;
  currentVersion: string;
  model: LlmModel;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  avatarColor: string;
  totalChats: number;
  lastTrainingAt: Date | null;
  workspaceId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentVersionResponse {
  id: string;
  agentId: string;
  versionNumber: string;
  systemPrompt: string;
  model: LlmModel;
  temperature: number;
  maxTokens: number;
  changelog: string | null;
  createdById: string;
  createdAt: Date;
}
