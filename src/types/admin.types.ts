export const PLATFORM_ROLES = [
  "ADMIN",
  "DEVELOPER",
  "VIEWER",
  "WORKSPACE_OWNER",
] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export interface AdminPlatformStats {
  totalUsers: number;
  totalWorkspaces: number;
  totalAgents: number;
  activeAgents: number;
  totalChatMessages: number;
  totalTokensUsed: number;
  totalCostUsd: number;
  totalKnowledgeFiles: number;
  totalTrainingJobs: number;
  totalApiKeys: number;
  system: {
    nodeVersion: string;
    platform: string;
    uptimeSeconds: number;
    memoryMb: number;
    databaseConnected: boolean;
  };
}

export interface AdminTelemetry {
  uptimeSeconds: number;
  processMemoryMb: number;
  nodeVersion: string;
  platform: string;
  databaseConnected: boolean;
  timestamp: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: PlatformRole;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminWorkspace {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    members: number;
    agents: number;
  };
}

export interface AdminSystemLog {
  id: string;
  level: string;
  message: string;
  metadata: Record<string, unknown> | null;
  timestamp: string;
}

export interface AdminUserQueryParams {
  search?: string;
  role?: PlatformRole;
  page?: number;
  limit?: number;
}

export interface AdminWorkspaceQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminSystemLogQueryParams {
  limit?: number;
  level?: string;
}

export interface UpdateAdminUserDto {
  role?: PlatformRole;
  isVerified?: boolean;
}
