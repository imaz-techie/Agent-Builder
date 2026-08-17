import { useQuery } from "@tanstack/react-query";
import { promptService } from "@/services/prompt.service";
import { QUERY_KEYS } from "@/constants/api.constants";
import { useActiveWorkspaceId } from "@/hooks/queries/useWorkspaceQueries";
import { isRealWorkspaceId } from "@/lib/workspace-id";

export function usePromptTemplatesQuery(category?: string) {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: QUERY_KEYS.PROMPTS.TEMPLATES(workspaceId),
    queryFn: () => promptService.getTemplates(workspaceId, category),
    enabled: isRealWorkspaceId(workspaceId),
    staleTime: 60 * 1000,
  });
}

export function usePromptTemplateQuery(templateId: string | null) {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: QUERY_KEYS.PROMPTS.TEMPLATE_DETAIL(templateId ?? ""),
    queryFn: () => promptService.getTemplateDetails(templateId!, workspaceId),
    enabled: Boolean(templateId) && isRealWorkspaceId(workspaceId),
  });
}

export function usePromptExecutionsQuery() {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: QUERY_KEYS.PROMPTS.EXECUTIONS(workspaceId),
    queryFn: () => promptService.getExecutions(workspaceId),
    enabled: isRealWorkspaceId(workspaceId),
    staleTime: 30 * 1000,
  });
}
