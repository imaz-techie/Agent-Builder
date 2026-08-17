import { useQuery } from "@tanstack/react-query";
import { knowledgeService } from "@/services/knowledge.service";
import { QUERY_KEYS } from "@/constants/api.constants";
import { useActiveWorkspaceId } from "@/hooks/queries/useWorkspaceQueries";
import { isRealWorkspaceId } from "@/lib/workspace-id";

export function useKnowledgeFilesQuery() {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: QUERY_KEYS.KNOWLEDGE.FILES(workspaceId),
    queryFn: () => knowledgeService.getKnowledgeFiles(workspaceId),
    enabled: isRealWorkspaceId(workspaceId),
    staleTime: 60 * 1000,
  });
}
