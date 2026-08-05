import { ChatRole } from "@prisma/client";
import { CitationItem } from "./rag.interface";

export interface CreateSessionDTO {
  agentId: string;
  title?: string;
  metadata?: Record<string, unknown>;
}

export interface SendChatMessageDTO {
  sessionId: string;
  content: string;
  enableRag?: boolean;
}

export interface ConversationSessionResponse {
  id: string;
  agentId: string;
  title: string;
  metadata: Record<string, unknown> | null;
  workspaceId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessageResponse {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  tokensCount: number;
  latencyMs: number;
  citations: CitationItem[] | null;
  workspaceId: string;
  createdById: string;
  createdAt: Date;
}
