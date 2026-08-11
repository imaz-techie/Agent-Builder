import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminService } from "@/services/admin.service";
import type { UpdateAdminUserDto } from "@/types/admin.types";

const USERS_QUERY_PREFIX = ["admin", "users"] as const;

export function useUpdateAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, dto }: { userId: string; dto: UpdateAdminUserDto }) =>
      adminService.updateUser(userId, dto),
    onSuccess: () => {
      toast.success("User updated");
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_PREFIX });
    },
    onError: (error: Error) => {
      toast.error("Failed to update user", { description: error.message });
    },
  });
}

export function useDeleteAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_PREFIX });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete user", { description: error.message });
    },
  });
}
