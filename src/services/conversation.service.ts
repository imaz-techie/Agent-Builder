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
import { resolveWorkspaceId } from "@/lib/workspace-id";

export const conversationService = {
  async getSessions(workspaceId?: string, agentId?: string): Promise<ConversationSession[]> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ sessions: ConversationSession[] }>>(
      API_ENDPOINTS.CHAT.SESSIONS(wsId),
      { params: { agentId } }
    );
    return response.data.data.sessions;
  },

  async createSession(workspaceId: string | undefined, dto: CreateSessionDto): Promise<ConversationSession> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.post<ApiResponse<{ session: ConversationSession }>>(
      API_ENDPOINTS.CHAT.SESSIONS(wsId),
      dto
    );
    return response.data.data.session;
  },

  async getSessionMessages(sessionId: string, workspaceId?: string): Promise<ChatMessage[]> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ messages: ChatMessage[] }>>(
      API_ENDPOINTS.CHAT.SESSION_MESSAGES(wsId, sessionId)
    );
    return response.data.data.messages;
  },

  async sendMessage(workspaceId: string | undefined, dto: SendMessageDto): Promise<SendMessageResult> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.post<ApiResponse<SendMessageResult>>(
      API_ENDPOINTS.CHAT.SEND_MESSAGE(wsId),
      dto
    );
    return response.data.data;
  },
};

