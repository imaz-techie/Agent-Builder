import { DeploymentEnvironment, DeploymentStatus } from "@prisma/client";

export interface CreateDeploymentDTO {
  agentId: string;
  environment?: DeploymentEnvironment;
  versionNumber?: string;
  url?: string;
  domain?: string;
}

export interface UpdateDeploymentDTO {
  status?: DeploymentStatus;
  url?: string;
  domain?: string;
}

export interface DeploymentQueryParams {
  agentId?: string;
  environment?: DeploymentEnvironment;
  status?: DeploymentStatus;
  page?: string;
  limit?: string;
}
