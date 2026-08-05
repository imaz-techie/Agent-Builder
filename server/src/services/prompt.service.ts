import { promptRepository } from "../repositories/prompt.repository";
import { workspaceRepository } from "../repositories/workspace.repository";
import { ApiError } from "../utils/apiError";
import {
  CreatePromptTemplateDTO,
  UpdatePromptTemplateDTO,
  ExecutePromptDTO,
  ComparePromptsDTO,
} from "../interfaces/prompt.interface";
import { LlmModel, PromptExecution } from "@prisma/client";

/**
 * Parses {{variable_name}} patterns from prompt template text
 */
function extractTemplateVariables(templateText: string): string[] {
  if (!templateText) return [];
  const matches = templateText.match(/\{\{([a-zA-Z0-9_]+)\}\}/g);
  if (!matches) return [];
  const vars = matches.map((m) => m.replace(/[\{\}]/g, "").trim());
  return Array.from(new Set(vars));
}

/**
 * Replaces {{var}} placeholders with user variable inputs
 */
function substituteVariables(templateText: string, variables: Record<string, string> = {}): string {
  let result = templateText;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(regex, value);
  }
  return result;
}

function sanitizeExecution(execution: PromptExecution) {
  return {
    id: execution.id,
    templateId: execution.templateId,
    agentId: execution.agentId,
    systemPrompt: execution.systemPrompt,
    userPrompt: execution.userPrompt,
    variablesUsed: execution.variablesUsed,
    model: execution.model,
    outputContent: execution.outputContent,
    latencyMs: execution.latencyMs,
    tokensUsed: execution.tokensUsed,
    workspaceId: execution.workspaceId,
    createdById: execution.createdById,
    createdAt: execution.createdAt,
  };
}

export class PromptService {
  async createTemplate(workspaceId: string, userId: string, dto: CreatePromptTemplateDTO) {
    const variables = extractTemplateVariables(dto.userPromptTemplate);

    const template = await promptRepository.createTemplate({
      title: dto.title,
      description: dto.description,
      category: dto.category,
      systemPrompt: dto.systemPrompt,
      userPromptTemplate: dto.userPromptTemplate,
      variables,
      model: dto.model,
      temperature: dto.temperature,
      maxTokens: dto.maxTokens,
      isPublic: dto.isPublic,
      workspaceId,
      createdById: userId,
    });

    await workspaceRepository.logAuditAction(userId, workspaceId, "PROMPT_TEMPLATE_CREATED", {
      templateId: template.id,
      title: template.title,
    });

    return template;
  }

  async getWorkspaceTemplates(workspaceId: string, category?: string) {
    return promptRepository.findTemplatesByWorkspace(workspaceId, category);
  }

  async getTemplateDetails(templateId: string, workspaceId: string) {
    const template = await promptRepository.findTemplateById(templateId, workspaceId);
    if (!template) {
      throw ApiError.notFound("Prompt template not found in this workspace");
    }
    return template;
  }

  async updateTemplate(
    templateId: string,
    workspaceId: string,
    userId: string,
    dto: UpdatePromptTemplateDTO
  ) {
    const existing = await promptRepository.findTemplateById(templateId, workspaceId);
    if (!existing) {
      throw ApiError.notFound("Prompt template not found in this workspace");
    }

    const newTemplateText = dto.userPromptTemplate || existing.userPromptTemplate;
    const variables = extractTemplateVariables(newTemplateText);

    const updated = await promptRepository.updateTemplate(templateId, workspaceId, {
      title: dto.title,
      description: dto.description,
      category: dto.category,
      systemPrompt: dto.systemPrompt,
      userPromptTemplate: dto.userPromptTemplate,
      variables,
      model: dto.model,
      temperature: dto.temperature,
      maxTokens: dto.maxTokens,
      isPublic: dto.isPublic,
    });

    await workspaceRepository.logAuditAction(userId, workspaceId, "PROMPT_TEMPLATE_UPDATED", {
      templateId,
    });

    return updated;
  }

  async deleteTemplate(templateId: string, workspaceId: string, userId: string) {
    const result = await promptRepository.deleteTemplate(templateId, workspaceId);
    if (result.count === 0) {
      throw ApiError.notFound("Prompt template not found in this workspace");
    }

    await workspaceRepository.logAuditAction(userId, workspaceId, "PROMPT_TEMPLATE_DELETED", {
      templateId,
    });
  }

  async executePrompt(workspaceId: string, userId: string, dto: ExecutePromptDTO) {
    const startTime = Date.now();

    const systemPrompt = dto.systemPrompt || "You are a helpful AI assistant.";
    const substitutedUserPrompt = substituteVariables(dto.userPrompt, dto.variables);
    const model = dto.model || LlmModel.GPT_4O;

    // Simulated LLM execution response
    const outputContent = `[Simulated LLM Output from ${model}]\nProcessed Prompt: "${substitutedUserPrompt}"\nResponse: Based on your input parameters, here is the generated response.`;
    const latencyMs = Math.floor(Math.random() * 400) + 200; // 200-600ms latency
    const tokensUsed = Math.ceil((substitutedUserPrompt.length + outputContent.length) / 4);

    const execution = await promptRepository.createExecution({
      templateId: dto.templateId,
      agentId: dto.agentId,
      systemPrompt,
      userPrompt: substitutedUserPrompt,
      variablesUsed: dto.variables,
      model,
      outputContent,
      latencyMs: Date.now() - startTime + latencyMs,
      tokensUsed,
      workspaceId,
      createdById: userId,
    });

    return sanitizeExecution(execution);
  }

  async streamPromptExecution(
    workspaceId: string,
    userId: string,
    dto: ExecutePromptDTO,
    onChunk: (chunk: string) => void
  ) {
    const startTime = Date.now();

    const systemPrompt = dto.systemPrompt || "You are a helpful AI assistant.";
    const substitutedUserPrompt = substituteVariables(dto.userPrompt, dto.variables);
    const model = dto.model || LlmModel.GPT_4O;

    const simulatedOutput = `[Simulated LLM Output from ${model}]\nProcessed Prompt: "${substitutedUserPrompt}"\nResponse: Based on your input parameters, here is the generated response.`;

    let fullOutput = "";
    for (const word of simulatedOutput.split(" ")) {
      const chunk = fullOutput ? ` ${word}` : word;
      fullOutput += chunk;
      onChunk(chunk);
    }

    const execution = await promptRepository.createExecution({
      templateId: dto.templateId,
      agentId: dto.agentId,
      systemPrompt,
      userPrompt: substitutedUserPrompt,
      variablesUsed: dto.variables,
      model,
      outputContent: fullOutput,
      latencyMs: Date.now() - startTime,
      tokensUsed: Math.ceil((substitutedUserPrompt.length + fullOutput.length) / 4),
      workspaceId,
      createdById: userId,
    });

    return sanitizeExecution(execution);
  }

  async comparePrompts(workspaceId: string, userId: string, dto: ComparePromptsDTO) {
    const results = await Promise.all(
      dto.configs.map(async (config) => {
        const startTime = Date.now();
        const systemPrompt = config.systemPrompt || "You are a helpful AI assistant.";
        const substitutedUserPrompt = substituteVariables(dto.userPrompt, dto.variables);
        const outputContent = `[Output from ${config.name} (${config.model})]\nResponse output evaluating prompt config with temperature ${config.temperature ?? 0.7}.`;
        const latencyMs = Math.floor(Math.random() * 300) + 150;
        const tokensUsed = Math.ceil((substitutedUserPrompt.length + outputContent.length) / 4);

        const execution = await promptRepository.createExecution({
          systemPrompt,
          userPrompt: substitutedUserPrompt,
          variablesUsed: dto.variables,
          model: config.model,
          outputContent,
          latencyMs: Date.now() - startTime + latencyMs,
          tokensUsed,
          workspaceId,
          createdById: userId,
        });

        return {
          configName: config.name,
          model: config.model,
          executionId: execution.id,
          outputContent,
          latencyMs: execution.latencyMs,
          tokensUsed,
        };
      })
    );

    return results;
  }

  async getExecutionHistory(workspaceId: string) {
    const executions = await promptRepository.findExecutionsByWorkspace(workspaceId);
    return executions.map(sanitizeExecution);
  }
}

export const promptService = new PromptService();
