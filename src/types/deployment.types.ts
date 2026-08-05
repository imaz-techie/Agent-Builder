export type DeploymentEnvironment = "production" | "staging" | "development";

export type DeploymentStatus =
  | "active"
  | "pending"
  | "failed"
  | "rolled_back";

export interface Deployment {
  id: string;
  agentName: string;
  environment: DeploymentEnvironment;
  version: string;
  status: DeploymentStatus;
  deployedAt: string;
}

export interface CreateDeploymentDto {
  agentId: string;
  environment: DeploymentEnvironment;
  version: string;
}
