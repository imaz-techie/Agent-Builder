import { prisma } from "../database";
import {
  DeploymentEnvironment,
  DeploymentStatus,
} from "@prisma/client";

export interface DeploymentFilters {
  agentId?: string;
  environment?: DeploymentEnvironment;
  status?: DeploymentStatus;
  skip: number;
  take: number;
}

export class DeploymentRepository {
  async createDeployment(data: {
    agentId: string;
    workspaceId: string;
    environment: DeploymentEnvironment;
    status: DeploymentStatus;
    versionNumber: string;
    url?: string;
    domain?: string;
    deployedById: string;
  }) {
    return prisma.agentDeployment.create({
      data,
      include: { agent: true },
    });
  }

  async findDeployments(workspaceId: string, filters: DeploymentFilters) {
    const where: Record<string, unknown> = { workspaceId };
    if (filters.agentId) where.agentId = filters.agentId;
    if (filters.environment) where.environment = filters.environment;
    if (filters.status) where.status = filters.status;

    const [items, totalItems] = await Promise.all([
      prisma.agentDeployment.findMany({
        where,
        include: { agent: true },
        orderBy: { deployedAt: "desc" },
        skip: filters.skip,
        take: filters.take,
      }),
      prisma.agentDeployment.count({ where }),
    ]);

    return { items, totalItems };
  }

  async findDeploymentById(id: string, workspaceId: string) {
    return prisma.agentDeployment.findFirst({
      where: { id, workspaceId },
      include: { agent: true },
    });
  }

  async findPreviousDeployment(
    workspaceId: string,
    agentId: string,
    environment: DeploymentEnvironment,
    before: Date
  ) {
    return prisma.agentDeployment.findFirst({
      where: {
        workspaceId,
        agentId,
        environment,
        deployedAt: { lt: before },
      },
      orderBy: { deployedAt: "desc" },
    });
  }

  async setAllInactive(
    workspaceId: string,
    agentId: string,
    environment: DeploymentEnvironment
  ) {
    return prisma.agentDeployment.updateMany({
      where: {
        workspaceId,
        agentId,
        environment,
        status: DeploymentStatus.ACTIVE,
      },
      data: { status: DeploymentStatus.INACTIVE },
    });
  }

  async updateDeployment(
    id: string,
    workspaceId: string,
    data: { status?: DeploymentStatus; url?: string; domain?: string }
  ) {
    return prisma.agentDeployment.update({
      where: { id },
      data,
      include: { agent: true },
    });
  }

  async deleteDeployment(id: string, workspaceId: string) {
    return prisma.agentDeployment.deleteMany({
      where: { id, workspaceId },
    });
  }

  async countDeployments(workspaceId: string) {
    return prisma.agentDeployment.count({ where: { workspaceId } });
  }
}

export const deploymentRepository = new DeploymentRepository();
