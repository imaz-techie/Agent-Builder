export interface AnalyticsOverviewResponse {
  totalChats: number;
  totalTokens: number;
  totalCostUsd: number;
  avgLatencyMs: number;
  activeAgentsCount: number;
  totalKnowledgeFiles: number;
}

export interface UsageTimeSeriesItem {
  date: string;
  chats: number;
  tokens: number;
  costUsd: number;
  avgLatencyMs: number;
}

export interface AgentPerformanceItem {
  agentId: string;
  agentName: string;
  model: string;
  totalChats: number;
  totalTokens: number;
  estimatedCostUsd: number;
  avgLatencyMs: number;
}

export interface AuditLogQueryParams {
  action?: string;
  userId?: string;
  page?: string;
  limit?: string;
}
