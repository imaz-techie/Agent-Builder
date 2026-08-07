import { useQuery } from "@tanstack/react-query";
import { knowledgeService } from "@/services/knowledge.service";
import { QUERY_KEYS } from "@/constants/api.constants";
import { useActiveWorkspaceId } from "@/hooks/queries/useWorkspaceQueries";

export function useKnowledgeFilesQuery() {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: QUERY_KEYS.KNOWLEDGE.FILES(workspaceId),
    queryFn: () => knowledgeService.getKnowledgeFiles(workspaceId),
    staleTime: 60 * 1000,
  });
}
