import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type {
  Workspace,
  WorkspaceBranding,
  WorkspaceDetails,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  UpdateBrandingDto,
  UpdateSecurityDto,
} from "@/types/workspace.types";

export const workspaceService = {
  async getWorkspaces(): Promise<Workspace[]> {
    const response = await apiClient.get<ApiResponse<{ workspaces: Workspace[] }>>(
      API_ENDPOINTS.WORKSPACES.LIST
    );
    return response.data.data.workspaces;
  },

  async getWorkspaceDetails(workspaceId: string): Promise<WorkspaceDetails> {
    const response = await apiClient.get<ApiResponse<{ workspace: WorkspaceDetails }>>(
      API_ENDPOINTS.WORKSPACES.DETAIL(workspaceId)
    );
    return response.data.data.workspace;
  },

  async createWorkspace(dto: CreateWorkspaceDto): Promise<Workspace> {
    const response = await apiClient.post<ApiResponse<{ workspace: Workspace }>>(
      API_ENDPOINTS.WORKSPACES.LIST,
      dto
    );
    return response.data.data.workspace;
  },

  async updateWorkspace(workspaceId: string, dto: UpdateWorkspaceDto): Promise<Workspace> {
    const response = await apiClient.patch<ApiResponse<{ workspace: Workspace }>>(
      API_ENDPOINTS.WORKSPACES.DETAIL(workspaceId),
      dto
    );
    return response.data.data.workspace;
  },

  async deleteWorkspace(workspaceId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.WORKSPACES.DETAIL(workspaceId));
  },

  async updateBranding(
    workspaceId: string,
    dto: UpdateBrandingDto
  ): Promise<WorkspaceBranding | null> {
    const response = await apiClient.put<ApiResponse<{ workspace: WorkspaceDetails }>>(
      API_ENDPOINTS.WORKSPACES.BRANDING(workspaceId),
      dto
    );
    return response.data.data.workspace.branding;
  },

  async updateSecurity(workspaceId: string, dto: UpdateSecurityDto): Promise<string[]> {
    const response = await apiClient.patch<ApiResponse<{ workspace: WorkspaceDetails }>>(
      API_ENDPOINTS.WORKSPACES.SECURITY(workspaceId),
      dto
    );
    return response.data.data.workspace.ipWhitelist;
  },
};
