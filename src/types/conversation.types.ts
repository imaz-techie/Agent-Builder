export type ChatRole = "USER" | "ASSISTANT" | "SYSTEM";

export interface ConversationSession {
  id: string;
  agentId: string;
  title: string;
  metadata: Record<string, unknown> | null;
  workspaceId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  tokensCount: number;
  latencyMs: number | null;
  citations: unknown[] | null;
  workspaceId: string;
  createdById: string;
  createdAt: string;
}

export interface CreateSessionDto {
  agentId: string;
  title?: string;
  metadata?: Record<string, unknown>;
}

export interface SendMessageDto {
  sessionId: string;
  content: string;
  enableRag?: boolean;
}

export interface SendMessageResult {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}
