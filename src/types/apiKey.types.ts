export type ApiKeyPermission = "read" | "write" | "admin";

export interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  permissions: ApiKeyPermission[];
  lastUsed: string;
  createdAt: string;
}

export interface CreateApiKeyDto {
  name: string;
  permissions: ApiKeyPermission[];
}
