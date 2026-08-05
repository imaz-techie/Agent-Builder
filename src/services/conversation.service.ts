import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type { Conversation, SendMessageDto, ChatMessage } from "@/types/conversation.types";
import { conversations as mockConversations } from "@/lib/mock-data";

export const conversationService = {
  async getConversations(agentId?: string): Promise<Conversation[]> {
    try {
      const response = await apiClient.get<ApiResponse<Conversation[]>>(
        API_ENDPOINTS.CONVERSATIONS.LIST,
        { params: { agentId } }
      );
      return response.data.data;
    } catch {
      if (agentId) {
        return mockConversations.filter((c) => c.agentName.toLowerCase().includes(agentId.toLowerCase()));
      }
      return mockConversations;
    }
  },

  async getConversationById(id: string): Promise<Conversation> {
    try {
      const response = await apiClient.get<ApiResponse<Conversation>>(
        API_ENDPOINTS.CONVERSATIONS.DETAIL(id)
      );
      return response.data.data;
    } catch {
      const found = mockConversations.find((c) => c.id === id);
      if (!found) throw new Error("Conversation not found");
      return found;
    }
  },

  async sendMessage(dto: SendMessageDto): Promise<ChatMessage> {
    try {
      const response = await apiClient.post<ApiResponse<ChatMessage>>(
        API_ENDPOINTS.CONVERSATIONS.SEND,
        dto
      );
      return response.data.data;
    } catch {
      return {
        id: `msg_${Date.now()}`,
        conversationId: dto.conversationId || `conv_${Date.now()}`,
        sender: "agent",
        text: `Echo response from agent (${dto.agentId}): Thank you for your message!`,
        timestamp: new Date().toISOString(),
      };
    }
  },
};
