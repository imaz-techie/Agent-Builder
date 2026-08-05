import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type { Deployment, CreateDeploymentDto } from "@/types/deployment.types";
import { deployments as mockDeployments } from "@/lib/mock-data";

export const deploymentService = {
  async getDeployments(): Promise<Deployment[]> {
    try {
      const response = await apiClient.get<ApiResponse<Deployment[]>>(
        API_ENDPOINTS.DEPLOYMENTS.LIST
      );
      return response.data.data;
    } catch {
      return mockDeployments;
    }
  },

  async createDeployment(dto: CreateDeploymentDto): Promise<Deployment> {
    try {
      const response = await apiClient.post<ApiResponse<Deployment>>(
        API_ENDPOINTS.DEPLOYMENTS.CREATE,
        dto
      );
      return response.data.data;
    } catch {
      const newDeployment: Deployment = {
        id: `dep_${Date.now()}`,
        agentName: dto.agentId,
        environment: dto.environment,
        version: dto.version,
        status: "active",
        deployedAt: new Date().toISOString(),
      };
      mockDeployments.unshift(newDeployment);
      return newDeployment;
    }
  },
};
