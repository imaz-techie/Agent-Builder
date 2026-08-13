import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import { QUERY_KEYS } from "@/constants/api.constants";
import type { NotificationQueryParams } from "@/types/notification.types";

export function useNotificationsQuery(params?: NotificationQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.LIST(params as Record<string, unknown> | undefined),
    queryFn: () => notificationService.getNotifications(params),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT,
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useNotificationPreferencesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.PREFERENCES,
    queryFn: () => notificationService.getPreferences(),
    staleTime: 5 * 60 * 1000,
  });
}
