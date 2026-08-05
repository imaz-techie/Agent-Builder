export type AgentStatus = "active" | "training" | "draft" | "inactive";

export type AgentCategory =
  | "Customer Support"
  | "Sales"
  | "Development"
  | "Marketing"
  | "HR"
  | "Analytics";

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  model: string;
  status: AgentStatus;
  version: string;
  lastTraining: string;
  totalChats: number;
  createdAt: string;
  owner: string;
  avatarColor: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface CreateAgentDto {
  name: string;
  description: string;
  category: AgentCategory;
  model: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  avatarColor?: string;
}

export interface UpdateAgentDto extends Partial<CreateAgentDto> {
  status?: AgentStatus;
  version?: string;
}

export interface AgentFilterQueryParams {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}
