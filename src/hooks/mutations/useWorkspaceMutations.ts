import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { workspaceService } from "@/services/workspace.service";
import type { CreateWorkspaceDto, UpdateWorkspaceDto } from "@/types/workspace.types";
import { QUERY_KEYS } from "@/constants/api.constants";
import { setActiveWorkspaceId } from "@/lib/workspace-id";

export function useCreateWorkspaceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateWorkspaceDto) => workspaceService.createWorkspace(dto),
    onSuccess: (workspace) => {
      toast.success("Workspace created!", { description: workspace.name });
      setActiveWorkspaceId(workspace.id);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKSPACES.LIST });
    },
    onError: (error: Error) => {
      toast.error("Failed to create workspace", { description: error.message });
    },
  });
}

export function useUpdateWorkspaceMutation(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateWorkspaceDto) => workspaceService.updateWorkspace(workspaceId, dto),
    onSuccess: () => {
      toast.success("Workspace updated");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKSPACES.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKSPACES.DETAIL(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Failed to update workspace", { description: error.message });
    },
  });
}

export function useDeleteWorkspaceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) => workspaceService.deleteWorkspace(workspaceId),
    onSuccess: () => {
      toast.success("Workspace deleted");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKSPACES.LIST });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete workspace", { description: error.message });
    },
  });
}
