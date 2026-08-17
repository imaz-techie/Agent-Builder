import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type { Agent, CreateAgentDto, UpdateAgentDto, AgentFilterQueryParams } from "@/types/agent.types";
import { resolveWorkspaceId } from "@/lib/workspace-id";

export const agentService = {
  async getAgents(workspaceId?: string, params?: AgentFilterQueryParams): Promise<Agent[]> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ agents: Agent[] }>>(
      API_ENDPOINTS.WORKSPACES.AGENTS(wsId),
      { params }
    );
    return response.data.data.agents;
  },

  async getAgentById(agentId: string, workspaceId?: string): Promise<Agent> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ agent: Agent }>>(
      API_ENDPOINTS.WORKSPACES.AGENT_DETAIL(wsId, agentId)
    );
    return response.data.data.agent;
  },

  async createAgent(dto: CreateAgentDto, workspaceId?: string): Promise<Agent> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.post<ApiResponse<{ agent: Agent }>>(
      API_ENDPOINTS.WORKSPACES.AGENTS(wsId),
      dto
    );
    return response.data.data.agent;
  },

  async updateAgent(agentId: string, dto: UpdateAgentDto, workspaceId?: string): Promise<Agent> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.patch<ApiResponse<{ agent: Agent }>>(
      API_ENDPOINTS.WORKSPACES.AGENT_DETAIL(wsId, agentId),
      dto
    );
    return response.data.data.agent;
  },

  async cloneAgent(agentId: string, workspaceId?: string, name?: string): Promise<Agent> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.post<ApiResponse<{ agent: Agent }>>(
      `${API_ENDPOINTS.WORKSPACES.AGENT_DETAIL(wsId, agentId)}/clone`,
      { name }
    );
    return response.data.data.agent;
  },

  async archiveAgent(agentId: string, workspaceId?: string): Promise<Agent> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.post<ApiResponse<{ agent: Agent }>>(
      `${API_ENDPOINTS.WORKSPACES.AGENT_DETAIL(wsId, agentId)}/archive`
    );
    return response.data.data.agent;
  },

  async deleteAgent(agentId: string, workspaceId?: string): Promise<void> {
    const wsId = resolveWorkspaceId(workspaceId);
    await apiClient.delete(API_ENDPOINTS.WORKSPACES.AGENT_DETAIL(wsId, agentId));
  },
};

