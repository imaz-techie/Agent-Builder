export interface DashboardStats {
  totalAgents: number;
  activeChats: number;
  totalConversations: number;
  totalTokens: number;
  monthlyCost: number;
  uptime: number;
  avgResponseTime: number;
  satisfactionScore: number;
}

export interface MonthlyUsage {
  month: string;
  conversations: number;
  tokens: number;
  cost: number;
}

export interface AgentDistribution {
  name: string;
  value: number;
  color: string;
}

export type ActivityType =
  | "agent_created"
  | "deployment"
  | "training"
  | "knowledge_update"
  | "user_signup"
  | "config_change"
  | "billing"
  | "alert";

export interface ActivityTimelineItem {
  id: string;
  type: ActivityType;
  message: string;
  time: string;
}
