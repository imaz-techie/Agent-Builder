import { deploymentRepository } from "../repositories/deployment.repository";
import { agentRepository } from "../repositories/agent.repository";
import { workspaceRepository } from "../repositories/workspace.repository";
import { ApiError } from "../utils/apiError";
import { parsePaginationParams, formatPaginatedResult } from "../utils/pagination";
import {
  CreateDeploymentDTO,
  UpdateDeploymentDTO,
  DeploymentQueryParams,
} from "../interfaces/deployment.interface";
import {
  DeploymentEnvironment,
  DeploymentStatus,
} from "@prisma/client";

export class DeploymentService {
  async createDeployment(workspaceId: string, userId: string, dto: CreateDeploymentDTO) {
    const agent = await agentRepository.findAgentById(dto.agentId, workspaceId);
    if (!agent) {
      throw ApiError.notFound("Agent not found in this workspace");
    }

    const environment = dto.environment || DeploymentEnvironment.PRODUCTION;
    const versionNumber = dto.versionNumber || agent.currentVersion;

    // Only one active deployment per agent + environment
    await deploymentRepository.setAllInactive(workspaceId, dto.agentId, environment);

    const deployment = await deploymentRepository.createDeployment({
      agentId: dto.agentId,
      workspaceId,
      environment,
      status: DeploymentStatus.ACTIVE,
      versionNumber,
      url: dto.url,
      domain: dto.domain,
      deployedById: userId,
    });

    await workspaceRepository.logAuditAction(userId, workspaceId, "AGENT_DEPLOYED", {
      agentId: dto.agentId,
      environment,
      versionNumber,
    });

    return deployment;
  }

  async getWorkspaceDeployments(workspaceId: string, queryParams: DeploymentQueryParams) {
    const { page, limit, skip } = parsePaginationParams({
      page: queryParams.page,
      limit: queryParams.limit,
    });

    const { items, totalItems } = await deploymentRepository.findDeployments(workspaceId, {
      agentId: queryParams.agentId,
      environment: queryParams.environment,
      status: queryParams.status,
      skip,
      take: limit,
    });

    return formatPaginatedResult(items, totalItems, { page, limit, skip });
  }

  async getDeploymentDetails(deploymentId: string, workspaceId: string) {
    const deployment = await deploymentRepository.findDeploymentById(deploymentId, workspaceId);
    if (!deployment) {
      throw ApiError.notFound("Deployment not found in this workspace");
    }
    return deployment;
  }

  async updateDeployment(deploymentId: string, workspaceId: string, userId: string, dto: UpdateDeploymentDTO) {
    const existing = await deploymentRepository.findDeploymentById(deploymentId, workspaceId);
    if (!existing) {
      throw ApiError.notFound("Deployment not found in this workspace");
    }

    const deployment = await deploymentRepository.updateDeployment(deploymentId, workspaceId, dto);

    await workspaceRepository.logAuditAction(userId, workspaceId, "DEPLOYMENT_UPDATED", {
      deploymentId,
      status: dto.status,
    });

    return deployment;
  }

  async rollbackDeployment(deploymentId: string, workspaceId: string, userId: string) {
    const current = await deploymentRepository.findDeploymentById(deploymentId, workspaceId);
    if (!current) {
      throw ApiError.notFound("Deployment not found in this workspace");
    }

    const previous = await deploymentRepository.findPreviousDeployment(
      workspaceId,
      current.agentId,
      current.environment,
      current.deployedAt
    );

    if (!previous) {
      throw ApiError.badRequest("No previous deployment available for rollback");
    }

    // Deactivate all active deployments, restore previous, mark current rolled back
    await deploymentRepository.setAllInactive(workspaceId, current.agentId, current.environment);
    await deploymentRepository.updateDeployment(current.id, workspaceId, {
      status: DeploymentStatus.ROLLED_BACK,
    });
    const restored = await deploymentRepository.updateDeployment(previous.id, workspaceId, {
      status: DeploymentStatus.ACTIVE,
    });

    await workspaceRepository.logAuditAction(userId, workspaceId, "AGENT_ROLLED_BACK", {
      deploymentId,
      restoredDeploymentId: previous.id,
      environment: current.environment,
    });

    return restored;
  }

  async deleteDeployment(deploymentId: string, workspaceId: string, userId: string) {
    const result = await deploymentRepository.deleteDeployment(deploymentId, workspaceId);
    if (result.count === 0) {
      throw ApiError.notFound("Deployment not found in this workspace");
    }

    await workspaceRepository.logAuditAction(userId, workspaceId, "DEPLOYMENT_DELETED", {
      deploymentId,
    });

    return { deleted: result.count };
  }
}

export const deploymentService = new DeploymentService();
