import { useQuery } from "@tanstack/react-query";
import { knowledgeService } from "@/services/knowledge.service";
import { QUERY_KEYS } from "@/constants/api.constants";

export function useKnowledgeFilesQuery(workspaceId: string = "ws_default") {
  return useQuery({
    queryKey: QUERY_KEYS.KNOWLEDGE.FILES(workspaceId),
    queryFn: () => knowledgeService.getKnowledgeFiles(workspaceId),
    staleTime: 60 * 1000,
  });
}
