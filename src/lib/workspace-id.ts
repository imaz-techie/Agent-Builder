import { STORAGE_KEYS } from "@/constants/api.constants";

export const DEFAULT_WORKSPACE_ID = "ws_default";

export function getActiveWorkspaceId(): string {
  return sessionStorage.getItem(STORAGE_KEYS.WORKSPACE_ID) || DEFAULT_WORKSPACE_ID;
}

export function setActiveWorkspaceId(workspaceId: string): void {
  sessionStorage.setItem(STORAGE_KEYS.WORKSPACE_ID, workspaceId);
}
