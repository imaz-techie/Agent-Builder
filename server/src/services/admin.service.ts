import os from "os";
import { adminRepository } from "../repositories/admin.repository";
import { isDbConnected } from "../database";
import { parsePaginationParams, formatPaginatedResult } from "../utils/pagination";
import {
  AdminUserQueryParams,
  AdminWorkspaceQueryParams,
  UpdateAdminUserDTO,
  SystemTelemetry,
} from "../interfaces/admin.interface";
import { workspaceRepository } from "../repositories/workspace.repository";

export class AdminService {
  async getStats() {
    const stats = await adminRepository.getPlatformStats();
    const totalCostUsd = await adminRepository.getTotalSpendUsd();

    return {
      ...stats,
      totalCostUsd,
      system: {
        nodeVersion: process.version,
        platform: `${os.platform()} ${os.arch()}`,
        uptimeSeconds: Math.round(process.uptime()),
        memoryMb: Math.round(process.memoryUsage().heapUsed / (1024 * 1024)),
        databaseConnected: isDbConnected,
      },
    };
  }

  async getUsers(queryParams: AdminUserQueryParams) {
    const { page, limit, skip } = parsePaginationParams({
      page: queryParams.page,
      limit: queryParams.limit,
    });

    const { items, totalItems } = await adminRepository.findUsers({
      search: queryParams.search,
      role: queryParams.role,
      skip,
      take: limit,
    });

    return formatPaginatedResult(items, totalItems, { page, limit, skip });
  }

  async updateUser(userId: string, dto: UpdateAdminUserDTO) {
    const updated = await adminRepository.updateUser(userId, dto);
    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      avatarUrl: updated.avatarUrl,
      role: updated.role,
      isVerified: updated.isVerified,
      twoFactorEnabled: updated.twoFactorEnabled,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteUser(userId: string) {
    const deleted = await adminRepository.deleteUser(userId);
    return { deleted: deleted.id };
  }

  async getWorkspaces(queryParams: AdminWorkspaceQueryParams) {
    const { page, limit, skip } = parsePaginationParams({
      page: queryParams.page,
      limit: queryParams.limit,
    });

    const { items, totalItems } = await adminRepository.findWorkspaces({
      search: queryParams.search,
      skip,
      take: limit,
    });

    return formatPaginatedResult(items, totalItems, { page, limit, skip });
  }

  async getSystemLogs(limit = 50, level?: string) {
    const safeLimit = Math.min(500, Math.max(1, limit));
    const logs = await adminRepository.findSystemLogs(safeLimit, level);
    return logs;
  }

  async logAudit(userId: string, workspaceId: string | null, action: string, metadata?: Record<string, unknown>) {
    return workspaceRepository.logAuditAction(userId, workspaceId, action, metadata);
  }

  async getTelemetry(): Promise<SystemTelemetry> {
    const memoryUsage = process.memoryUsage();

    return {
      uptimeSeconds: Math.round(process.uptime()),
      processMemoryMb: Math.round(memoryUsage.rss / (1024 * 1024)),
      nodeVersion: process.version,
      platform: `${os.platform()} ${os.arch()}`,
      databaseConnected: isDbConnected,
      timestamp: new Date().toISOString(),
    };
  }
}

export const adminService = new AdminService();
