import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse, PaginationMeta } from "@/types/api.types";
import type { Agent, CreateAgentDto, UpdateAgentDto, AgentFilterQueryParams } from "@/types/agent.types";

export const agentService = {
  async getAgents(workspaceId: string = "ws_default", params?: AgentFilterQueryParams): Promise<Agent[]> {
    const response = await apiClient.get<ApiResponse<{ agents: Agent[] }>>(
      API_ENDPOINTS.WORKSPACES.AGENTS(workspaceId),
      { params }
    );
    return response.data.data.agents;
  },

  async getAgentById(agentId: string, workspaceId: string = "ws_default"): Promise<Agent> {
    const response = await apiClient.get<ApiResponse<{ agent: Agent }>>(
      API_ENDPOINTS.WORKSPACES.AGENT_DETAIL(workspaceId, agentId)
    );
    return response.data.data.agent;
  },

  async createAgent(dto: CreateAgentDto, workspaceId: string = "ws_default"): Promise<Agent> {
    const response = await apiClient.post<ApiResponse<{ agent: Agent }>>(
      API_ENDPOINTS.WORKSPACES.AGENTS(workspaceId),
      dto
    );
    return response.data.data.agent;
  },

  async updateAgent(agentId: string, dto: UpdateAgentDto, workspaceId: string = "ws_default"): Promise<Agent> {
    const response = await apiClient.patch<ApiResponse<{ agent: Agent }>>(
      API_ENDPOINTS.WORKSPACES.AGENT_DETAIL(workspaceId, agentId),
      dto
    );
    return response.data.data.agent;
  },

  async cloneAgent(agentId: string, workspaceId: string = "ws_default", name?: string): Promise<Agent> {
    const response = await apiClient.post<ApiResponse<{ agent: Agent }>>(
      `${API_ENDPOINTS.WORKSPACES.AGENT_DETAIL(workspaceId, agentId)}/clone`,
      { name }
    );
    return response.data.data.agent;
  },

  async archiveAgent(agentId: string, workspaceId: string = "ws_default"): Promise<Agent> {
    const response = await apiClient.post<ApiResponse<{ agent: Agent }>>(
      `${API_ENDPOINTS.WORKSPACES.AGENT_DETAIL(workspaceId, agentId)}/archive`
    );
    return response.data.data.agent;
  },

  async deleteAgent(agentId: string, workspaceId: string = "ws_default"): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.WORKSPACES.AGENT_DETAIL(workspaceId, agentId));
  },
};
