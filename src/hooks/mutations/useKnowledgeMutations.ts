import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { knowledgeService } from "@/services/knowledge.service";
import { QUERY_KEYS } from "@/constants/api.constants";
import { useActiveWorkspaceId } from "@/hooks/queries/useWorkspaceQueries";

export function useUploadKnowledgeFileMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (file: File) => knowledgeService.uploadKnowledgeFile(file, workspaceId),
    onSuccess: (uploadedFile) => {
      toast.success("File uploaded successfully", {
        description: `${uploadedFile.name} is now processing.`,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KNOWLEDGE.FILES(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Upload failed", { description: error.message });
    },
  });
}

export function useAddUrlSourceMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: ({ url, name }: { url: string; name?: string }) =>
      knowledgeService.addUrlSource(url, workspaceId, name),
    onSuccess: (file) => {
      toast.success("Web URL source added", { description: file.name });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KNOWLEDGE.FILES(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Failed to add URL source", { description: error.message });
    },
  });
}

export function useDeleteKnowledgeFileMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (fileId: string) => knowledgeService.deleteKnowledgeFile(fileId, workspaceId),
    onSuccess: () => {
      toast.success("File deleted from Knowledge Base");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KNOWLEDGE.FILES(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Delete failed", { description: error.message });
    },
  });
}

export function useReindexKnowledgeFileMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (fileId: string) => knowledgeService.reindexKnowledgeFile(fileId, workspaceId),
    onSuccess: (file) => {
      toast.success("File re-indexing triggered", { description: file.name });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KNOWLEDGE.FILES(workspaceId) });
    },
  });
}
