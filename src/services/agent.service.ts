import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type { Agent, CreateAgentDto, UpdateAgentDto, AgentFilterQueryParams } from "@/types/agent.types";
import { agents as mockAgents } from "@/lib/mock-data";

export const agentService = {
  async getAgents(workspaceId: string = "ws_default", params?: AgentFilterQueryParams): Promise<Agent[]> {
    try {
      const response = await apiClient.get<ApiResponse<Agent[]>>(
        API_ENDPOINTS.WORKSPACES.AGENTS(workspaceId),
        { params }
      );
      return response.data.data;
    } catch {
      let filtered = [...mockAgents];
      if (params?.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(
          (a) => a.name.toLowerCase().includes(query) || a.description.toLowerCase().includes(query)
        );
      }
      if (params?.category && params.category !== "All") {
        filtered = filtered.filter((a) => a.category === params.category);
      }
      if (params?.status && params.status !== "all") {
        filtered = filtered.filter((a) => a.status === params.status);
      }
      return filtered;
    }
  },

  async getAgentById(agentId: string, workspaceId: string = "ws_default"): Promise<Agent> {
    try {
      const response = await apiClient.get<ApiResponse<Agent>>(
        API_ENDPOINTS.WORKSPACES.AGENT_DETAIL(workspaceId, agentId)
      );
      return response.data.data;
    } catch {
      const found = mockAgents.find((a) => a.id === agentId);
      if (!found) throw new Error("Agent not found");
      return found;
    }
  },

  async createAgent(dto: CreateAgentDto, workspaceId: string = "ws_default"): Promise<Agent> {
    try {
      const response = await apiClient.post<ApiResponse<Agent>>(
        API_ENDPOINTS.WORKSPACES.AGENTS(workspaceId),
        dto
      );
      return response.data.data;
    } catch {
      const newAgent: Agent = {
        id: `ag_${Date.now()}`,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        model: dto.model,
        status: "draft",
        version: "1.0.0",
        lastTraining: new Date().toISOString(),
        totalChats: 0,
        createdAt: new Date().toISOString(),
        owner: "Current User",
        avatarColor: dto.avatarColor || "#6366f1",
      };
      mockAgents.unshift(newAgent);
      return newAgent;
    }
  },

  async updateAgent(agentId: string, dto: UpdateAgentDto, workspaceId: string = "ws_default"): Promise<Agent> {
    try {
      const response = await apiClient.put<ApiResponse<Agent>>(
        API_ENDPOINTS.WORKSPACES.AGENT_DETAIL(workspaceId, agentId),
        dto
      );
      return response.data.data;
    } catch {
      const index = mockAgents.findIndex((a) => a.id === agentId);
      if (index === -1) throw new Error("Agent not found");
      mockAgents[index] = { ...mockAgents[index], ...dto };
      return mockAgents[index];
    }
  },

  async deleteAgent(agentId: string, workspaceId: string = "ws_default"): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.WORKSPACES.AGENT_DETAIL(workspaceId, agentId));
    } catch {
      const index = mockAgents.findIndex((a) => a.id === agentId);
      if (index !== -1) {
        mockAgents.splice(index, 1);
      }
    }
  },
};
