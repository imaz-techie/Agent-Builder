import type { Agent } from "@/types/agent.types";

export type DeploymentEnvironment = "PRODUCTION" | "STAGING" | "DEVELOPMENT";

export type DeploymentStatus = "ACTIVE" | "INACTIVE" | "FAILED" | "ROLLED_BACK";

export interface Deployment {
  id: string;
  agentId: string;
  workspaceId: string;
  environment: DeploymentEnvironment;
  status: DeploymentStatus;
  versionNumber: string;
  url: string | null;
  domain: string | null;
  deployedById: string;
  deployedAt: string;
  createdAt: string;
  updatedAt: string;
  agent?: Agent;
}

export interface CreateDeploymentDto {
  agentId: string;
  environment?: DeploymentEnvironment;
  versionNumber?: string;
  url?: string;
  domain?: string;
}
