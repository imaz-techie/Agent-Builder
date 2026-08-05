import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { knowledgeService } from "@/services/knowledge.service";
import { QUERY_KEYS } from "@/constants/api.constants";

export function useUploadKnowledgeFileMutation(workspaceId: string = "ws_default") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => knowledgeService.uploadKnowledgeFile(file, workspaceId),
    onSuccess: (uploadedFile) => {
      toast.success("File uploaded successfully", {
        description: `${uploadedFile.name} is now processing.`,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KNOWLEDGE.ALL });
    },
    onError: (error: Error) => {
      toast.error("Upload failed", { description: error.message });
    },
  });
}

export function useDeleteKnowledgeFileMutation(workspaceId: string = "ws_default") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => knowledgeService.deleteKnowledgeFile(fileId, workspaceId),
    onSuccess: () => {
      toast.success("File deleted from Knowledge Base");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KNOWLEDGE.ALL });
    },
    onError: (error: Error) => {
      toast.error("Delete failed", { description: error.message });
    },
  });
}

export function useReindexKnowledgeFileMutation(workspaceId: string = "ws_default") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => knowledgeService.reindexKnowledgeFile(fileId, workspaceId),
    onSuccess: (file) => {
      toast.success("File re-indexing triggered", { description: file.name });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KNOWLEDGE.ALL });
    },
  });
}
