import { STORAGE_KEYS } from "@/constants/api.constants";

export const DEFAULT_WORKSPACE_ID = "ws_default";

export function getActiveWorkspaceId(): string {
  return sessionStorage.getItem(STORAGE_KEYS.WORKSPACE_ID) || DEFAULT_WORKSPACE_ID;
}

export function setActiveWorkspaceId(workspaceId: string): void {
  sessionStorage.setItem(STORAGE_KEYS.WORKSPACE_ID, workspaceId);
}

export function resolveWorkspaceId(workspaceId?: string): string {
  if (!workspaceId || workspaceId === DEFAULT_WORKSPACE_ID) {
    const active = sessionStorage.getItem(STORAGE_KEYS.WORKSPACE_ID);
    if (active && active !== DEFAULT_WORKSPACE_ID) {
      return active;
    }
  }
  return workspaceId || DEFAULT_WORKSPACE_ID;
}

