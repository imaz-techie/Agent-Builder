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

export const promptService = {
  async getTemplates(
    workspaceId: string = "ws_default",
    category?: string
  ): Promise<PromptTemplate[]> {
    const response = await apiClient.get<ApiResponse<{ templates: PromptTemplate[] }>>(
      API_ENDPOINTS.PROMPTS.TEMPLATES(workspaceId),
      { params: category ? { category } : undefined }
    );
    return response.data.data.templates;
  },

  async getTemplateDetails(
    templateId: string,
    workspaceId: string = "ws_default"
  ): Promise<PromptTemplate> {
    const response = await apiClient.get<ApiResponse<{ template: PromptTemplate }>>(
      API_ENDPOINTS.PROMPTS.TEMPLATE_DETAIL(workspaceId, templateId)
    );
    return response.data.data.template;
  },

  async createTemplate(
    dto: CreatePromptTemplateDto,
    workspaceId: string = "ws_default"
  ): Promise<PromptTemplate> {
    const response = await apiClient.post<ApiResponse<{ template: PromptTemplate }>>(
      API_ENDPOINTS.PROMPTS.TEMPLATES(workspaceId),
      dto
    );
    return response.data.data.template;
  },

  async updateTemplate(
    templateId: string,
    dto: UpdatePromptTemplateDto,
    workspaceId: string = "ws_default"
  ): Promise<PromptTemplate> {
    const response = await apiClient.patch<ApiResponse<{ template: PromptTemplate }>>(
      API_ENDPOINTS.PROMPTS.TEMPLATE_DETAIL(workspaceId, templateId),
      dto
    );
    return response.data.data.template;
  },

  async deleteTemplate(
    templateId: string,
    workspaceId: string = "ws_default"
  ): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PROMPTS.TEMPLATE_DETAIL(workspaceId, templateId));
  },

  async executePrompt(
    dto: ExecutePromptDto,
    workspaceId: string = "ws_default"
  ): Promise<PromptExecution> {
    const response = await apiClient.post<ApiResponse<{ execution: PromptExecution }>>(
      API_ENDPOINTS.PROMPTS.EXECUTE(workspaceId),
      dto
    );
    return response.data.data.execution;
  },

  async comparePrompts(
    dto: ComparePromptsDto,
    workspaceId: string = "ws_default"
  ): Promise<PromptComparisonResult[]> {
    const response = await apiClient.post<ApiResponse<{ comparisons: PromptComparisonResult[] }>>(
      API_ENDPOINTS.PROMPTS.COMPARE(workspaceId),
      dto
    );
    return response.data.data.comparisons;
  },

  async getExecutions(
    workspaceId: string = "ws_default"
  ): Promise<PromptExecution[]> {
    const response = await apiClient.get<ApiResponse<{ executions: PromptExecution[] }>>(
      API_ENDPOINTS.PROMPTS.EXECUTIONS(workspaceId)
    );
    return response.data.data.executions;
  },
};
