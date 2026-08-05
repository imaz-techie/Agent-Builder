export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "agent_builder_access_token",
  REFRESH_TOKEN: "agent_builder_refresh_token",
  USER_DATA: "agent_builder_user_data",
  WORKSPACE_ID: "agent_builder_active_workspace_id",
} as const;

export const QUERY_KEYS = {
  AUTH: {
    PROFILE: ["auth", "profile"] as const,
  },
  AGENTS: {
    ALL: ["agents"] as const,
    LIST: (workspaceId?: string) => ["agents", "list", workspaceId] as const,
    DETAIL: (id: string) => ["agents", "detail", id] as const,
  },
  KNOWLEDGE: {
    ALL: ["knowledge"] as const,
    FILES: (workspaceId?: string) => ["knowledge", "files", workspaceId] as const,
  },
  CONVERSATIONS: {
    ALL: ["conversations"] as const,
    LIST: (agentId?: string) => ["conversations", "list", agentId] as const,
    DETAIL: (id: string) => ["conversations", "detail", id] as const,
  },
  DEPLOYMENTS: {
    ALL: ["deployments"] as const,
    LIST: (workspaceId?: string) => ["deployments", "list", workspaceId] as const,
  },
  ANALYTICS: {
    DASHBOARD_STATS: ["analytics", "dashboard-stats"] as const,
    MONTHLY_USAGE: ["analytics", "monthly-usage"] as const,
    AGENT_DISTRIBUTION: ["analytics", "agent-distribution"] as const,
    TIMELINE: ["analytics", "timeline"] as const,
  },
  API_KEYS: {
    ALL: ["api-keys"] as const,
    LIST: (workspaceId?: string) => ["api-keys", "list", workspaceId] as const,
  },
  BILLING: {
    INVOICES: ["billing", "invoices"] as const,
    SUBSCRIPTION: ["billing", "subscription"] as const,
  },
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    FORGOT_PASSWORD: "/auth/forgot-password",
  },
  WORKSPACES: {
    LIST: "/workspaces",
    AGENTS: (workspaceId: string) => `/workspaces/${workspaceId}/agents`,
    AGENT_DETAIL: (workspaceId: string, agentId: string) => `/workspaces/${workspaceId}/agents/${agentId}`,
    KNOWLEDGE_FILES: (workspaceId: string) => `/workspaces/${workspaceId}/knowledge`,
    API_KEYS: (workspaceId: string) => `/workspaces/${workspaceId}/api-keys`,
  },
  ANALYTICS: {
    OVERVIEW: "/analytics/overview",
    USAGE: "/analytics/usage",
    DISTRIBUTION: "/analytics/distribution",
    TIMELINE: "/analytics/timeline",
  },
  DEPLOYMENTS: {
    LIST: "/deployments",
    CREATE: "/deployments",
  },
  BILLING: {
    INVOICES: "/billing/invoices",
    SUBSCRIPTION: "/billing/subscription",
  },
  CONVERSATIONS: {
    LIST: "/chat/conversations",
    DETAIL: (id: string) => `/chat/conversations/${id}`,
    SEND: "/chat/message",
  },
} as const;
