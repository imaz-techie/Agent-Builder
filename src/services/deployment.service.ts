import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type { Deployment, CreateDeploymentDto } from "@/types/deployment.types";
import { resolveWorkspaceId } from "@/lib/workspace-id";

export const deploymentService = {
  async getDeployments(workspaceId?: string): Promise<Deployment[]> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ deployments: Deployment[] }>>(
      API_ENDPOINTS.DEPLOYMENTS.LIST(wsId)
    );
    return response.data.data.deployments;
  },

  async createDeployment(dto: CreateDeploymentDto, workspaceId?: string): Promise<Deployment> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.post<ApiResponse<{ deployment: Deployment }>>(
      API_ENDPOINTS.DEPLOYMENTS.CREATE(wsId),
      dto
    );
    return response.data.data.deployment;
  },

  async rollbackDeployment(deploymentId: string, workspaceId?: string): Promise<Deployment> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.post<ApiResponse<{ deployment: Deployment }>>(
      API_ENDPOINTS.DEPLOYMENTS.ROLLBACK(wsId, deploymentId)
    );
    return response.data.data.deployment;
  },

  async deleteDeployment(deploymentId: string, workspaceId?: string): Promise<void> {
    const wsId = resolveWorkspaceId(workspaceId);
    await apiClient.delete<ApiResponse<unknown>>(
      API_ENDPOINTS.DEPLOYMENTS.DETAIL(wsId, deploymentId)
    );
  },
};

