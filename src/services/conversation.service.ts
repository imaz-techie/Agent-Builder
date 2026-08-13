import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type {
  ConversationSession,
  ChatMessage,
  CreateSessionDto,
  SendMessageDto,
  SendMessageResult,
} from "@/types/conversation.types";

export const conversationService = {
  async getSessions(workspaceId: string = "ws_default", agentId?: string): Promise<ConversationSession[]> {
    const response = await apiClient.get<ApiResponse<{ sessions: ConversationSession[] }>>(
      API_ENDPOINTS.CHAT.SESSIONS(workspaceId),
      { params: { agentId } }
    );
    return response.data.data.sessions;
  },

  async createSession(workspaceId: string = "ws_default", dto: CreateSessionDto): Promise<ConversationSession> {
    const response = await apiClient.post<ApiResponse<{ session: ConversationSession }>>(
      API_ENDPOINTS.CHAT.SESSIONS(workspaceId),
      dto
    );
    return response.data.data.session;
  },

  async getSessionMessages(sessionId: string, workspaceId: string = "ws_default"): Promise<ChatMessage[]> {
    const response = await apiClient.get<ApiResponse<{ messages: ChatMessage[] }>>(
      API_ENDPOINTS.CHAT.SESSION_MESSAGES(workspaceId, sessionId)
    );
    return response.data.data.messages;
  },

  async sendMessage(workspaceId: string = "ws_default", dto: SendMessageDto): Promise<SendMessageResult> {
    const response = await apiClient.post<ApiResponse<SendMessageResult>>(
      API_ENDPOINTS.CHAT.SEND_MESSAGE(workspaceId),
      dto
    );
    return response.data.data;
  },
};
