import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type {
  CreatePromptTemplateDto,
  PromptTemplate,
  UpdatePromptTemplateDto,
  ExecutePromptDto,
  PromptExecution,
  ComparePromptsDto,
  PromptComparisonResult,
} from "@/types/prompt.types";
import { resolveWorkspaceId } from "@/lib/workspace-id";

export const promptService = {
  async getTemplates(
    workspaceId?: string,
    category?: string
  ): Promise<PromptTemplate[]> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ templates: PromptTemplate[] }>>(
      API_ENDPOINTS.PROMPTS.TEMPLATES(wsId),
      { params: category ? { category } : undefined }
    );
    return response.data.data.templates;
  },

  async getTemplateDetails(
    templateId: string,
    workspaceId?: string
  ): Promise<PromptTemplate> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ template: PromptTemplate }>>(
      API_ENDPOINTS.PROMPTS.TEMPLATE_DETAIL(wsId, templateId)
    );
    return response.data.data.template;
  },

  async createTemplate(
    dto: CreatePromptTemplateDto,
    workspaceId?: string
  ): Promise<PromptTemplate> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.post<ApiResponse<{ template: PromptTemplate }>>(
      API_ENDPOINTS.PROMPTS.TEMPLATES(wsId),
      dto
    );
    return response.data.data.template;
  },

  async updateTemplate(
    templateId: string,
    dto: UpdatePromptTemplateDto,
    workspaceId?: string
  ): Promise<PromptTemplate> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.patch<ApiResponse<{ template: PromptTemplate }>>(
      API_ENDPOINTS.PROMPTS.TEMPLATE_DETAIL(wsId, templateId),
      dto
    );
    return response.data.data.template;
  },

  async deleteTemplate(
    templateId: string,
    workspaceId?: string
  ): Promise<void> {
    const wsId = resolveWorkspaceId(workspaceId);
    await apiClient.delete(API_ENDPOINTS.PROMPTS.TEMPLATE_DETAIL(wsId, templateId));
  },

  async executePrompt(
    dto: ExecutePromptDto,
    workspaceId?: string
  ): Promise<PromptExecution> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.post<ApiResponse<{ execution: PromptExecution }>>(
      API_ENDPOINTS.PROMPTS.EXECUTE(wsId),
      dto
    );
    return response.data.data.execution;
  },

  async comparePrompts(
    dto: ComparePromptsDto,
    workspaceId?: string
  ): Promise<PromptComparisonResult[]> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.post<ApiResponse<{ comparisons: PromptComparisonResult[] }>>(
      API_ENDPOINTS.PROMPTS.COMPARE(wsId),
      dto
    );
    return response.data.data.comparisons;
  },

  async getExecutions(
    workspaceId?: string
  ): Promise<PromptExecution[]> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ executions: PromptExecution[] }>>(
      API_ENDPOINTS.PROMPTS.EXECUTIONS(wsId)
    );
    return response.data.data.executions;
  },
};

