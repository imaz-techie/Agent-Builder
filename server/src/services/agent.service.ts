import { agentRepository } from "../repositories/agent.repository";
import { workspaceRepository } from "../repositories/workspace.repository";
import { ApiError } from "../utils/apiError";
import { parsePaginationParams, formatPaginatedResult } from "../utils/pagination";
import {
  CreateAgentDTO,
  UpdateAgentDTO,
  CloneAgentDTO,
  AgentQueryParams,
} from "../interfaces/agent.interface";
import { AgentStatus } from "@prisma/client";

export class AgentService {
  async createAgent(workspaceId: string, userId: string, dto: CreateAgentDTO) {
    const agent = await agentRepository.createAgent({
      name: dto.name,
      description: dto.description,
      category: dto.category,
      tags: dto.tags,
      status: dto.status,
      model: dto.model,
      temperature: dto.temperature,
      maxTokens: dto.maxTokens,
      systemPrompt: dto.systemPrompt,
      avatarColor: dto.avatarColor,
      workspaceId,
      createdById: userId,
    });

    await workspaceRepository.logAuditAction(userId, workspaceId, "AGENT_CREATED", {
      agentId: agent.id,
      name: agent.name,
    });

    return agent;
  }

  async getWorkspaceAgents(workspaceId: string, queryParams: AgentQueryParams) {
    const { page, limit, skip } = parsePaginationParams({
      page: queryParams.page,
      limit: queryParams.limit,
    });

    const { items, totalItems } = await agentRepository.findAgents(workspaceId, {
      search: queryParams.search,
      category: queryParams.category,
      status: queryParams.status,
      skip,
      take: limit,
    });

    return formatPaginatedResult(items, totalItems, { page, limit, skip });
  }

  async getAgentDetails(agentId: string, workspaceId: string) {
    const agent = await agentRepository.findAgentById(agentId, workspaceId);
    if (!agent) {
      throw ApiError.notFound("Agent not found in this workspace");
    }
    return agent;
  }

  async updateAgent(
    agentId: string,
    workspaceId: string,
    userId: string,
    dto: UpdateAgentDTO
  ) {
    const existing = await agentRepository.findAgentById(agentId, workspaceId);
    if (!existing) {
      throw ApiError.notFound("Agent not found in this workspace");
    }

    // Check if configuration changed requiring a version increment
    const promptChanged = dto.systemPrompt && dto.systemPrompt !== existing.systemPrompt;
    const modelChanged = dto.model && dto.model !== existing.model;

    let newVersion = existing.currentVersion;
    if (promptChanged || modelChanged) {
      const parts = existing.currentVersion.split(".").map(Number);
      newVersion = `${parts[0]}.${parts[1] + 1}.0`;

      await agentRepository.createAgentVersion({
        agentId,
        versionNumber: newVersion,
        systemPrompt: dto.systemPrompt || existing.systemPrompt,
        model: dto.model || existing.model,
        temperature: dto.temperature ?? existing.temperature,
        maxTokens: dto.maxTokens ?? existing.maxTokens,
        changelog: dto.changelog || "Updated agent parameters",
        createdById: userId,
      });
    }

    const updated = await agentRepository.updateAgent(agentId, workspaceId, {
      name: dto.name,
      description: dto.description,
      category: dto.category,
      tags: dto.tags,
      status: dto.status,
      model: dto.model,
      temperature: dto.temperature,
      maxTokens: dto.maxTokens,
      systemPrompt: dto.systemPrompt,
      avatarColor: dto.avatarColor,
      currentVersion: newVersion,
    });

    await workspaceRepository.logAuditAction(userId, workspaceId, "AGENT_UPDATED", {
      agentId,
      version: newVersion,
    });

    return updated;
  }

  async cloneAgent(agentId: string, workspaceId: string, userId: string, dto: CloneAgentDTO) {
    const sourceAgent = await agentRepository.findAgentById(agentId, workspaceId);
    if (!sourceAgent) {
      throw ApiError.notFound("Source agent not found in this workspace");
    }

    const cloneName = dto.name || `${sourceAgent.name} (Copy)`;

    const clonedAgent = await agentRepository.createAgent({
      name: cloneName,
      description: sourceAgent.description,
      category: sourceAgent.category,
      tags: [...sourceAgent.tags],
      status: AgentStatus.DRAFT,
      model: sourceAgent.model,
      temperature: sourceAgent.temperature,
      maxTokens: sourceAgent.maxTokens,
      systemPrompt: sourceAgent.systemPrompt,
      avatarColor: sourceAgent.avatarColor,
      workspaceId,
      createdById: userId,
    });

    await workspaceRepository.logAuditAction(userId, workspaceId, "AGENT_CLONED", {
      sourceAgentId: agentId,
      clonedAgentId: clonedAgent.id,
    });

    return clonedAgent;
  }

  async archiveAgent(agentId: string, workspaceId: string, userId: string) {
    const updated = await agentRepository.updateAgent(agentId, workspaceId, {
      status: AgentStatus.INACTIVE,
    });

    await workspaceRepository.logAuditAction(userId, workspaceId, "AGENT_ARCHIVED", {
      agentId,
    });

    return updated;
  }

  async deleteAgent(agentId: string, workspaceId: string, userId: string) {
    const result = await agentRepository.deleteAgent(agentId, workspaceId);
    if (result.count === 0) {
      throw ApiError.notFound("Agent not found in this workspace");
    }

    await workspaceRepository.logAuditAction(userId, workspaceId, "AGENT_DELETED", {
      agentId,
    });
  }

  async getAgentVersions(agentId: string, workspaceId: string) {
    const agent = await agentRepository.findAgentById(agentId, workspaceId);
    if (!agent) {
      throw ApiError.notFound("Agent not found in this workspace");
    }
    return agentRepository.getAgentVersions(agentId);
  }
}

export const agentService = new AgentService();
