export type ConversationStatus = "resolved" | "active" | "pending";

export interface Conversation {
  id: string;
  agentName: string;
  userName: string;
  messagePreview: string;
  timestamp: string;
  rating: number | null;
  status: ConversationStatus;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
}

export interface SendMessageDto {
  agentId: string;
  message: string;
  conversationId?: string;
}
