import crypto from "crypto";
import { apiKeyRepository } from "../repositories/apiKey.repository";
import { workspaceRepository } from "../repositories/workspace.repository";
import { CreateApiKeyDTO } from "../interfaces/workspace.interface";
import { ApiError } from "../utils/apiError";

export class ApiKeyService {
  async createApiKey(workspaceId: string, createdById: string, dto: CreateApiKeyDTO) {
    const rawRandom = crypto.randomBytes(24).toString("hex");
    const keyPrefix = "ag_live_" + rawRandom.substring(0, 8);
    const secretKey = `${keyPrefix}_${rawRandom}`;
    
    // Hash secret key for secure database storage (SHA-256)
    const keyHash = crypto.createHash("sha256").update(secretKey).digest("hex");

    let expiresAt: Date | undefined = undefined;
    if (dto.expiresInDays) {
      expiresAt = new Date(Date.now() + dto.expiresInDays * 24 * 60 * 60 * 1000);
    }

    const apiKey = await apiKeyRepository.createApiKey({
      name: dto.name,
      keyPrefix,
      keyHash,
      workspaceId,
      createdById,
      permissions: dto.permissions,
      expiresAt,
    });

    await workspaceRepository.logAuditAction(createdById, workspaceId, "API_KEY_CREATED", {
      name: dto.name,
      keyPrefix,
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      secretKey, // Returned ONLY once upon creation
      permissions: apiKey.permissions,
      createdAt: apiKey.createdAt,
      expiresAt: apiKey.expiresAt,
    };
  }

  async getWorkspaceApiKeys(workspaceId: string) {
    const keys = await apiKeyRepository.findApiKeysByWorkspaceId(workspaceId);
    return keys.map((k) => ({
      id: k.id,
      name: k.name,
      keyPrefix: k.keyPrefix,
      permissions: k.permissions,
      lastUsedAt: k.lastUsedAt,
      expiresAt: k.expiresAt,
      createdAt: k.createdAt,
    }));
  }

  async revokeApiKey(apiKeyId: string, workspaceId: string, userId: string) {
    const result = await apiKeyRepository.deleteApiKey(apiKeyId, workspaceId);
    if (result.count === 0) {
      throw ApiError.notFound("API Key not found in this workspace");
    }

    await workspaceRepository.logAuditAction(userId, workspaceId, "API_KEY_REVOKED", {
      apiKeyId,
    });
  }

  async validateApiKey(secretKey: string) {
    const keyHash = crypto.createHash("sha256").update(secretKey).digest("hex");
    const apiKey = await apiKeyRepository.findApiKeyByHash(keyHash);

    if (!apiKey) {
      throw ApiError.unauthorized("Invalid API key");
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      throw ApiError.unauthorized("API key has expired");
    }

    // Update last used timestamp asynchronously
    await apiKeyRepository.updateLastUsedAt(apiKey.id);

    return apiKey;
  }
}

export const apiKeyService = new ApiKeyService();
