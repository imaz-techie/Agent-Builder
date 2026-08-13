import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationService } from "@/services/notification.service";
import { QUERY_KEYS } from "@/constants/api.constants";
import type { UpdateNotificationPreferencesDto } from "@/types/notification.types";

const ALL_KEYS = QUERY_KEYS.NOTIFICATIONS.ALL;

function invalidateNotificationQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ALL_KEYS });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.markAsRead(notificationId),
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      toast.success("All notifications marked as read");
      invalidateNotificationQueries(queryClient);
    },
    onError: (error: Error) => {
      toast.error("Failed to mark notifications as read", {
        description: error.message,
      });
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
    onError: (error: Error) => {
      toast.error("Failed to delete notification", { description: error.message });
    },
  });
}

export function useUpdateNotificationPreferencesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateNotificationPreferencesDto) =>
      notificationService.updatePreferences(dto),
    onSuccess: () => {
      toast.success("Notification preferences updated");
      invalidateNotificationQueries(queryClient);
    },
    onError: (error: Error) => {
      toast.error("Failed to update notification preferences", {
        description: error.message,
      });
    },
  });
}
