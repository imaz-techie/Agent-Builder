export interface AnalyticsOverview {
  totalChats: number;
  totalTokens: number;
  totalCostUsd: number;
  avgLatencyMs: number;
  activeAgentsCount: number;
  totalKnowledgeFiles: number;
}

export interface UsageTimeSeriesPoint {
  date: string;
  chats: number;
  tokens: number;
  costUsd: number;
  avgLatencyMs: number;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  model: string;
  status: string;
  totalChats: number;
  totalTokens: number;
  estimatedCostUsd: number;
  avgLatencyMs: number;
}

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  workspaceId: string | null;
  action: string;
  ipAddress: string | null;
  metadata: unknown;
  createdAt: string;
}
