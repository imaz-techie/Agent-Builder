import { prisma } from "../database";
import { LlmModel, Prisma } from "@prisma/client";

export class PromptRepository {
  async createTemplate(data: {
    title: string;
    description?: string;
    category?: string;
    systemPrompt?: string;
    userPromptTemplate: string;
    variables: string[];
    model?: LlmModel;
    temperature?: number;
    maxTokens?: number;
    isPublic?: boolean;
    workspaceId: string;
    createdById: string;
  }) {
    return prisma.promptTemplate.create({
      data: {
        title: data.title,
        description: data.description || null,
        category: data.category || "General",
        systemPrompt: data.systemPrompt || "You are a helpful assistant.",
        userPromptTemplate: data.userPromptTemplate,
        variables: data.variables,
        model: data.model || LlmModel.GPT_4O,
        temperature: data.temperature ?? 0.7,
        maxTokens: data.maxTokens ?? 4096,
        isPublic: data.isPublic ?? false,
        workspaceId: data.workspaceId,
        createdById: data.createdById,
      },
    });
  }

  async findTemplateById(id: string, workspaceId: string) {
    return prisma.promptTemplate.findFirst({
      where: { id, workspaceId },
    });
  }

  async findTemplatesByWorkspace(workspaceId: string, category?: string) {
    const where: Prisma.PromptTemplateWhereInput = {
      workspaceId,
      ...(category ? { category } : {}),
    };

    return prisma.promptTemplate.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });
  }

  async updateTemplate(
    id: string,
    workspaceId: string,
    data: Prisma.PromptTemplateUpdateInput
  ) {
    return prisma.promptTemplate.update({
      where: { id },
      data,
    });
  }

  async deleteTemplate(id: string, workspaceId: string) {
    return prisma.promptTemplate.deleteMany({
      where: { id, workspaceId },
    });
  }

  async createExecution(data: {
    templateId?: string;
    agentId?: string;
    systemPrompt: string;
    userPrompt: string;
    variablesUsed?: Record<string, string>;
    model: LlmModel;
    outputContent: string;
    latencyMs: number;
    tokensUsed: number;
    workspaceId: string;
    createdById: string;
  }) {
    return prisma.promptExecution.create({
      data: {
        templateId: data.templateId || null,
        agentId: data.agentId || null,
        systemPrompt: data.systemPrompt,
        userPrompt: data.userPrompt,
        variablesUsed: data.variablesUsed ? JSON.parse(JSON.stringify(data.variablesUsed)) : undefined,
        model: data.model,
        outputContent: data.outputContent,
        latencyMs: data.latencyMs,
        tokensUsed: data.tokensUsed,
        workspaceId: data.workspaceId,
        createdById: data.createdById,
      },
    });
  }

  async findExecutionsByWorkspace(workspaceId: string, limit = 20) {
    return prisma.promptExecution.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

export const promptRepository = new PromptRepository();
