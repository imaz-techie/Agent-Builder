import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse, PaginationMeta } from "@/types/api.types";
import type {
  AdminPlatformStats,
  AdminSystemLog,
  AdminSystemLogQueryParams,
  AdminTelemetry,
  AdminUser,
  AdminUserQueryParams,
  AdminWorkspace,
  AdminWorkspaceQueryParams,
  UpdateAdminUserDto,
} from "@/types/admin.types";

export const adminService = {
  async getStats(): Promise<AdminPlatformStats> {
    const response = await apiClient.get<ApiResponse<{ stats: AdminPlatformStats }>>(
      API_ENDPOINTS.ADMIN.STATS
    );
    return response.data.data.stats;
  },

  async getTelemetry(): Promise<AdminTelemetry> {
    const response = await apiClient.get<ApiResponse<{ telemetry: AdminTelemetry }>>(
      API_ENDPOINTS.ADMIN.TELEMETRY
    );
    return response.data.data.telemetry;
  },

  async getUsers(params?: AdminUserQueryParams): Promise<{
    users: AdminUser[];
    meta?: PaginationMeta;
  }> {
    const response = await apiClient.get<ApiResponse<{ users: AdminUser[] }>>(
      API_ENDPOINTS.ADMIN.USERS,
      { params }
    );
    return {
      users: response.data.data.users,
      meta: response.data.meta as PaginationMeta | undefined,
    };
  },

  async updateUser(userId: string, dto: UpdateAdminUserDto): Promise<AdminUser> {
    const response = await apiClient.patch<ApiResponse<{ user: AdminUser }>>(
      API_ENDPOINTS.ADMIN.USER_DETAIL(userId),
      dto
    );
    return response.data.data.user;
  },

  async deleteUser(userId: string): Promise<string> {
    const response = await apiClient.delete<ApiResponse<{ deleted: string }>>(
      API_ENDPOINTS.ADMIN.USER_DETAIL(userId)
    );
    return response.data.data.deleted;
  },

  async getWorkspaces(params?: AdminWorkspaceQueryParams): Promise<{
    workspaces: AdminWorkspace[];
    meta?: PaginationMeta;
  }> {
    const response = await apiClient.get<ApiResponse<{ workspaces: AdminWorkspace[] }>>(
      API_ENDPOINTS.ADMIN.WORKSPACES,
      { params }
    );
    return {
      workspaces: response.data.data.workspaces,
      meta: response.data.meta as PaginationMeta | undefined,
    };
  },

  async getSystemLogs(params?: AdminSystemLogQueryParams): Promise<AdminSystemLog[]> {
    const response = await apiClient.get<ApiResponse<{ logs: AdminSystemLog[] }>>(
      API_ENDPOINTS.ADMIN.LOGS,
      { params }
    );
    return response.data.data.logs;
  },
};
