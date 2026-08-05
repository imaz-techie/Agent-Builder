import { prisma } from "../database";
import { AgentStatus, LlmModel, Prisma } from "@prisma/client";

export class AgentRepository {
  async createAgent(data: {
    name: string;
    description: string;
    category?: string;
    tags?: string[];
    status?: AgentStatus;
    model?: LlmModel;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    avatarColor?: string;
    workspaceId: string;
    createdById: string;
  }) {
    return prisma.agent.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category || "General",
        tags: data.tags || [],
        status: data.status || AgentStatus.DRAFT,
        model: data.model || LlmModel.GPT_4O,
        temperature: data.temperature ?? 0.7,
        maxTokens: data.maxTokens ?? 4096,
        systemPrompt: data.systemPrompt || "You are a helpful AI assistant.",
        avatarColor: data.avatarColor || "#3B82F6",
        workspaceId: data.workspaceId,
        createdById: data.createdById,
        versions: {
          create: {
            versionNumber: "1.0.0",
            systemPrompt: data.systemPrompt || "You are a helpful AI assistant.",
            model: data.model || LlmModel.GPT_4O,
            temperature: data.temperature ?? 0.7,
            maxTokens: data.maxTokens ?? 4096,
            changelog: "Initial agent creation",
            createdById: data.createdById,
          },
        },
      },
      include: {
        versions: true,
      },
    });
  }

  async findAgentById(id: string, workspaceId: string) {
    return prisma.agent.findFirst({
      where: { id, workspaceId },
      include: { versions: { orderBy: { createdAt: "desc" } } },
    });
  }

  async findAgents(
    workspaceId: string,
    params: {
      search?: string;
      category?: string;
      status?: AgentStatus;
      skip?: number;
      take?: number;
    }
  ) {
    const where: Prisma.AgentWhereInput = {
      workspaceId,
      ...(params.status ? { status: params.status } : {}),
      ...(params.category ? { category: params.category } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" } },
              { description: { contains: params.search, mode: "insensitive" } },
              { tags: { hasSome: [params.search] } },
            ],
          }
        : {}),
    };

    const [items, totalItems] = await Promise.all([
      prisma.agent.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: params.skip || 0,
        take: params.take || 10,
      }),
      prisma.agent.count({ where }),
    ]);

    return { items, totalItems };
  }

  async updateAgent(
    id: string,
    workspaceId: string,
    data: Prisma.AgentUpdateInput
  ) {
    return prisma.agent.update({
      where: { id },
      data,
    });
  }

  async deleteAgent(id: string, workspaceId: string) {
    return prisma.agent.deleteMany({
      where: { id, workspaceId },
    });
  }

  async createAgentVersion(data: {
    agentId: string;
    versionNumber: string;
    systemPrompt: string;
    model: LlmModel;
    temperature: number;
    maxTokens: number;
    changelog?: string;
    createdById: string;
  }) {
    return prisma.agentVersion.create({
      data,
    });
  }

  async getAgentVersions(agentId: string) {
    return prisma.agentVersion.findMany({
      where: { agentId },
      orderBy: { createdAt: "desc" },
    });
  }

  async incrementAgentChats(id: string) {
    return prisma.agent.update({
      where: { id },
      data: {
        totalChats: { increment: 1 },
      },
    });
  }
}

export const agentRepository = new AgentRepository();
