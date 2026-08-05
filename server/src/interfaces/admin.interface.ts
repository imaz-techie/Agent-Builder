import { Role } from "@prisma/client";

export interface AdminUserQueryParams {
  search?: string;
  role?: Role;
  page?: string;
  limit?: string;
}

export interface AdminWorkspaceQueryParams {
  search?: string;
  page?: string;
  limit?: string;
}

export interface UpdateAdminUserDTO {
  role?: Role;
  isVerified?: boolean;
}

export interface PlatformStats {
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
}

export interface SystemTelemetry {
  uptimeSeconds: number;
  processMemoryMb: number;
  nodeVersion: string;
  platform: string;
  databaseConnected: boolean;
  timestamp: string;
}
