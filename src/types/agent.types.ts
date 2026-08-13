export const AGENT_STATUSES = ["DRAFT", "TRAINING", "ACTIVE", "INACTIVE", "DEPLOYING"] as const;
export type AgentStatus = (typeof AGENT_STATUSES)[number];

export const LLM_MODELS = [
  "GPT_4O",
  "GPT_4O_MINI",
  "CLAUDE_3_5_SONNET",
  "CLAUDE_3_HAIKU",
  "GEMINI_1_5_PRO",
  "LLAMA_3_1_70B",
] as const;
export type LlmModel = (typeof LLM_MODELS)[number];

export interface AgentVersion {
  id: string;
  agentId: string;
  versionNumber: string;
  systemPrompt: string;
  model: LlmModel;
  temperature: number;
  maxTokens: number;
  changelog: string | null;
  createdById: string;
  createdAt: string;
}

export interface Agent {
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
  lastTrainingAt: string | null;
  workspaceId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  versions?: AgentVersion[];
}

export interface CreateAgentDto {
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

export interface UpdateAgentDto extends Partial<CreateAgentDto> {
  changelog?: string;
}

export interface AgentFilterQueryParams {
  search?: string;
  category?: string;
  status?: AgentStatus;
  page?: number;
  limit?: number;
}

export const MODEL_OPTIONS: { label: string; value: LlmModel }[] = [
  { label: "GPT-4o", value: "GPT_4O" },
  { label: "GPT-4o Mini", value: "GPT_4O_MINI" },
  { label: "Claude 3.5 Sonnet", value: "CLAUDE_3_5_SONNET" },
  { label: "Claude 3 Haiku", value: "CLAUDE_3_HAIKU" },
  { label: "Gemini 1.5 Pro", value: "GEMINI_1_5_PRO" },
  { label: "Llama 3.1 70B", value: "LLAMA_3_1_70B" },
];

export function formatModelLabel(model: string): string {
  const match = MODEL_OPTIONS.find((m) => m.value === model);
  return match?.label ?? model;
}
