export type ApiKeyPermission = "READ" | "WRITE" | "ADMIN";

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: ApiKeyPermission[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface ApiKeyWithSecret extends ApiKey {
  secretKey: string;
}

export interface CreateApiKeyDto {
  name: string;
  permissions?: ApiKeyPermission[];
  expiresInDays?: number;
}
