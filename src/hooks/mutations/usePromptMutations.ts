import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { promptService } from "@/services/prompt.service";
import { QUERY_KEYS } from "@/constants/api.constants";
import { useActiveWorkspaceId } from "@/hooks/queries/useWorkspaceQueries";
import type {
  CreatePromptTemplateDto,
  ExecutePromptDto,
  UpdatePromptTemplateDto,
} from "@/types/prompt.types";

export function useCreatePromptTemplateMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (dto: CreatePromptTemplateDto) => promptService.createTemplate(dto, workspaceId),
    onSuccess: () => {
      toast.success("Prompt template created");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROMPTS.TEMPLATES(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Failed to create template", { description: error.message });
    },
  });
}

export function useUpdatePromptTemplateMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: ({ templateId, dto }: { templateId: string; dto: UpdatePromptTemplateDto }) =>
      promptService.updateTemplate(templateId, dto, workspaceId),
    onSuccess: (template) => {
      toast.success("Prompt template updated", { description: template.title });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROMPTS.TEMPLATES(workspaceId) });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PROMPTS.TEMPLATE_DETAIL(template.id),
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to update template", { description: error.message });
    },
  });
}

export function useDeletePromptTemplateMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (templateId: string) => promptService.deleteTemplate(templateId, workspaceId),
    onSuccess: () => {
      toast.success("Prompt template deleted");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROMPTS.TEMPLATES(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete template", { description: error.message });
    },
  });
}

export function useExecutePromptMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (dto: ExecutePromptDto) => promptService.executePrompt(dto, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROMPTS.EXECUTIONS(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Prompt execution failed", { description: error.message });
    },
  });
}
