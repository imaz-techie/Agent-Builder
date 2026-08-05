import { analyticsRepository } from "../repositories/analytics.repository";
import { calculateTokenCost } from "../utils/costCalculator";
import { parsePaginationParams, formatPaginatedResult } from "../utils/pagination";
import { AuditLogQueryParams } from "../interfaces/analytics.interface";
import { LlmModel } from "@prisma/client";

export class AnalyticsService {
  async getOverview(workspaceId: string) {
    const stats = await analyticsRepository.getWorkspaceMessageStats(workspaceId);
    const agents = await analyticsRepository.getWorkspaceAgents(workspaceId);
    const filesCount = await analyticsRepository.getKnowledgeFilesCount(workspaceId);

    // Calculate total USD cost across workspace agents
    let totalCostUsd = 0;
    agents.forEach((agent) => {
      let agentTokens = 0;
      agent.chatSessions.forEach((session) => {
        session.messages.forEach((msg) => {
          agentTokens += msg.tokensCount;
        });
      });
      totalCostUsd += calculateTokenCost(agent.model, agentTokens);
    });

    return {
      totalChats: stats.totalMessages,
      totalTokens: stats.totalTokens,
      totalCostUsd: parseFloat(totalCostUsd.toFixed(4)),
      avgLatencyMs: stats.avgLatencyMs,
      activeAgentsCount: agents.filter((a) => a.status === "ACTIVE").length,
      totalKnowledgeFiles: filesCount,
    };
  }

  async getUsageTimeSeries(workspaceId: string) {
    const agents = await analyticsRepository.getWorkspaceAgents(workspaceId);

    // Generate daily time series for the last 7 days
    const result = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      let dayChats = 0;
      let dayTokens = 0;
      let dayCost = 0;
      let latencySum = 0;
      let latencyCount = 0;

      agents.forEach((agent) => {
        agent.chatSessions.forEach((session) => {
          session.messages.forEach((msg) => {
            const msgDate = msg.createdAt.toISOString().split("T")[0];
            if (msgDate === dateStr) {
              dayChats += 1;
              dayTokens += msg.tokensCount;
              dayCost += calculateTokenCost(agent.model, msg.tokensCount);
              if (msg.role === "ASSISTANT" && msg.latencyMs > 0) {
                latencySum += msg.latencyMs;
                latencyCount += 1;
              }
            }
          });
        });
      });

      result.push({
        date: dateStr,
        chats: dayChats,
        tokens: dayTokens,
        costUsd: parseFloat(dayCost.toFixed(4)),
        avgLatencyMs: latencyCount > 0 ? Math.round(latencySum / latencyCount) : 0,
      });
    }

    return result;
  }

  async getAgentPerformance(workspaceId: string) {
    const agents = await analyticsRepository.getWorkspaceAgents(workspaceId);

    return agents.map((agent) => {
      let totalChats = 0;
      let totalTokens = 0;
      let latencySum = 0;
      let latencyCount = 0;

      agent.chatSessions.forEach((session) => {
        session.messages.forEach((msg) => {
          totalChats += 1;
          totalTokens += msg.tokensCount;
          if (msg.role === "ASSISTANT" && msg.latencyMs > 0) {
            latencySum += msg.latencyMs;
            latencyCount += 1;
          }
        });
      });

      const estimatedCostUsd = calculateTokenCost(agent.model, totalTokens);

      return {
        agentId: agent.id,
        agentName: agent.name,
        model: agent.model,
        status: agent.status,
        totalChats,
        totalTokens,
        estimatedCostUsd,
        avgLatencyMs: latencyCount > 0 ? Math.round(latencySum / latencyCount) : 0,
      };
    });
  }

  async getAuditLogs(workspaceId: string, queryParams: AuditLogQueryParams) {
    const { page, limit, skip } = parsePaginationParams({
      page: queryParams.page,
      limit: queryParams.limit,
    });

    const { items, totalItems } = await analyticsRepository.findAuditLogs(workspaceId, {
      action: queryParams.action,
      userId: queryParams.userId,
      skip,
      take: limit,
    });

    return formatPaginatedResult(items, totalItems, { page, limit, skip });
  }

  async exportAnalyticsData(workspaceId: string, format = "csv") {
    const overview = await this.getOverview(workspaceId);
    const agentPerformance = await this.getAgentPerformance(workspaceId);

    if (format === "json") {
      return JSON.stringify({ overview, agentPerformance }, null, 2);
    }

    // CSV format generation
    let csv = "Agent Name,Model,Status,Total Chats,Total Tokens,Avg Latency (ms),Cost (USD)\n";
    agentPerformance.forEach((a) => {
      csv += `"${a.agentName}","${a.model}","${a.status}",${a.totalChats},${a.totalTokens},${a.avgLatencyMs},${a.estimatedCostUsd}\n`;
    });

    return csv;
  }
}

export const analyticsService = new AnalyticsService();
