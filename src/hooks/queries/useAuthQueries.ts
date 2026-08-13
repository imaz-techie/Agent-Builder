import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { QUERY_KEYS, STORAGE_KEYS } from "@/constants/api.constants";

export function useProfileQuery() {
  const hasToken = Boolean(sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN));
  return useQuery({
    queryKey: QUERY_KEYS.AUTH.PROFILE,
    queryFn: () => authService.getProfile(),
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSessionsQuery() {
  const hasToken = Boolean(sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN));
  return useQuery({
    queryKey: QUERY_KEYS.AUTH.SESSIONS,
    queryFn: () => authService.getSessions(),
    enabled: hasToken,
    staleTime: 30 * 1000,
  });
}
