import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type { Deployment, CreateDeploymentDto } from "@/types/deployment.types";

export const deploymentService = {
  async getDeployments(workspaceId: string = "ws_default"): Promise<Deployment[]> {
    const response = await apiClient.get<ApiResponse<{ deployments: Deployment[] }>>(
      API_ENDPOINTS.DEPLOYMENTS.LIST(workspaceId)
    );
    return response.data.data.deployments;
  },

  async createDeployment(workspaceId: string = "ws_default", dto: CreateDeploymentDto): Promise<Deployment> {
    const response = await apiClient.post<ApiResponse<{ deployment: Deployment }>>(
      API_ENDPOINTS.DEPLOYMENTS.CREATE(workspaceId),
      dto
    );
    return response.data.data.deployment;
  },

  async rollbackDeployment(workspaceId: string = "ws_default", deploymentId: string): Promise<Deployment> {
    const response = await apiClient.post<ApiResponse<{ deployment: Deployment }>>(
      API_ENDPOINTS.DEPLOYMENTS.ROLLBACK(workspaceId, deploymentId)
    );
    return response.data.data.deployment;
  },

  async deleteDeployment(workspaceId: string = "ws_default", deploymentId: string): Promise<void> {
    await apiClient.delete<ApiResponse<unknown>>(
      API_ENDPOINTS.DEPLOYMENTS.DETAIL(workspaceId, deploymentId)
    );
  },
};
