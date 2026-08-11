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
    SESSIONS: ["auth", "sessions"] as const,
  },
  WORKSPACES: {
    LIST: ["workspaces", "list"] as const,
    DETAIL: (workspaceId: string) => ["workspaces", "detail", workspaceId] as const,
  },
  AGENTS: {
    ALL: ["agents"] as const,
    LIST: (workspaceId?: string) => ["agents", "list", workspaceId] as const,
    DETAIL: (agentId: string) => ["agents", "detail", agentId] as const,
  },
  KNOWLEDGE: {
    ALL: ["knowledge"] as const,
    FILES: (workspaceId?: string) => ["knowledge", "files", workspaceId] as const,
    DETAIL: (fileId: string) => ["knowledge", "detail", fileId] as const,
  },
  CONVERSATIONS: {
    ALL: ["conversations"] as const,
    SESSIONS: (workspaceId?: string) => ["conversations", "sessions", workspaceId] as const,
    MESSAGES: (sessionId: string) => ["conversations", "messages", sessionId] as const,
    DETAIL: (id: string) => ["conversations", "detail", id] as const,
  },
  DEPLOYMENTS: {
    ALL: ["deployments"] as const,
    LIST: (workspaceId?: string) => ["deployments", "list", workspaceId] as const,
    DETAIL: (deploymentId: string) => ["deployments", "detail", deploymentId] as const,
  },
  ANALYTICS: {
    OVERVIEW: (workspaceId?: string) => ["analytics", "overview", workspaceId] as const,
    USAGE: (workspaceId?: string) => ["analytics", "usage", workspaceId] as const,
    AGENTS: (workspaceId?: string) => ["analytics", "agents", workspaceId] as const,
    AUDIT_LOGS: (workspaceId?: string) => ["analytics", "audit-logs", workspaceId] as const,
  },
  API_KEYS: {
    ALL: ["api-keys"] as const,
    LIST: (workspaceId?: string) => ["api-keys", "list", workspaceId] as const,
  },
  BILLING: {
    ACCOUNT: (workspaceId?: string) => ["billing", "account", workspaceId] as const,
    INVOICES: (workspaceId?: string) => ["billing", "invoices", workspaceId] as const,
    USAGE: (workspaceId?: string) => ["billing", "usage", workspaceId] as const,
  },
  PROMPTS: {
    TEMPLATES: (workspaceId?: string) => ["prompts", "templates", workspaceId] as const,
    TEMPLATE_DETAIL: (templateId: string) => ["prompts", "templates", templateId] as const,
    EXECUTIONS: (workspaceId?: string) => ["prompts", "executions", workspaceId] as const,
  },
  TRAINING: {
    DATASETS: (workspaceId?: string) => ["training", "datasets", workspaceId] as const,
    JOBS: (workspaceId?: string) => ["training", "jobs", workspaceId] as const,
    JOB_DETAIL: (jobId: string) => ["training", "jobs", jobId] as const,
    JOB_LOGS: (jobId: string) => ["training", "logs", jobId] as const,
  },
  WIDGET: {
    CONFIG: (agentId: string) => ["widget", "config", agentId] as const,
  },
  NOTIFICATIONS: {
    ALL: ["notifications"] as const,
    LIST: (filters?: Record<string, unknown>) =>
      ["notifications", "list", filters ?? {}] as const,
    UNREAD_COUNT: ["notifications", "unread-count"] as const,
    PREFERENCES: ["notifications", "preferences"] as const,
  },
  ADMIN: {
    STATS: ["admin", "stats"] as const,
    TELEMETRY: ["admin", "telemetry"] as const,
    USERS: (filters?: Record<string, unknown>) =>
      ["admin", "users", filters ?? {}] as const,
    WORKSPACES: (filters?: Record<string, unknown>) =>
      ["admin", "workspaces", filters ?? {}] as const,
    LOGS: (filters?: Record<string, unknown>) =>
      ["admin", "logs", filters ?? {}] as const,
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
    CHANGE_PASSWORD: "/auth/change-password",
    SESSIONS: "/auth/sessions",
    SESSION_DETAIL: (sessionId: string) => `/auth/sessions/${sessionId}`,
    TFA_ENABLE: "/auth/2fa/enable",
    TFA_CONFIRM: "/auth/2fa/confirm",
    TFA_DISABLE: "/auth/2fa/disable",
  },
  WORKSPACES: {
    LIST: "/workspaces",
    DETAIL: (workspaceId: string) => `/workspaces/${workspaceId}`,
    BRANDING: (workspaceId: string) => `/workspaces/${workspaceId}/branding`,
    SECURITY: (workspaceId: string) => `/workspaces/${workspaceId}/security`,
    AGENTS: (workspaceId: string) => `/workspaces/${workspaceId}/agents`,
    AGENT_DETAIL: (workspaceId: string, agentId: string) => `/workspaces/${workspaceId}/agents/${agentId}`,
    KNOWLEDGE_FILES: (workspaceId: string) => `/workspaces/${workspaceId}/knowledge/files`,
    KNOWLEDGE_UPLOAD: (workspaceId: string) => `/workspaces/${workspaceId}/knowledge/upload`,
    KNOWLEDGE_URL: (workspaceId: string) => `/workspaces/${workspaceId}/knowledge/url`,
    KNOWLEDGE_FILE_DETAIL: (workspaceId: string, fileId: string) => `/workspaces/${workspaceId}/knowledge/files/${fileId}`,
    KNOWLEDGE_FILE_REINDEX: (workspaceId: string, fileId: string) => `/workspaces/${workspaceId}/knowledge/files/${fileId}/reindex`,
    API_KEYS: (workspaceId: string) => `/workspaces/${workspaceId}/api-keys`,
    API_KEY_DETAIL: (workspaceId: string, keyId: string) => `/workspaces/${workspaceId}/api-keys/${keyId}`,
  },
  CHAT: {
    SESSIONS: (workspaceId: string) => `/workspaces/${workspaceId}/chat/sessions`,
    SESSION_MESSAGES: (workspaceId: string, sessionId: string) => `/workspaces/${workspaceId}/chat/sessions/${sessionId}/messages`,
    SEND_MESSAGE: (workspaceId: string) => `/workspaces/${workspaceId}/chat/messages`,
  },
  DEPLOYMENTS: {
    LIST: (workspaceId: string) => `/workspaces/${workspaceId}/deployments`,
    CREATE: (workspaceId: string) => `/workspaces/${workspaceId}/deployments`,
    DETAIL: (workspaceId: string, deploymentId: string) => `/workspaces/${workspaceId}/deployments/${deploymentId}`,
    ROLLBACK: (workspaceId: string, deploymentId: string) => `/workspaces/${workspaceId}/deployments/${deploymentId}/rollback`,
  },
  ANALYTICS: {
    OVERVIEW: (workspaceId: string) => `/workspaces/${workspaceId}/analytics/overview`,
    USAGE: (workspaceId: string) => `/workspaces/${workspaceId}/analytics/usage`,
    AGENTS: (workspaceId: string) => `/workspaces/${workspaceId}/analytics/agents`,
    AUDIT_LOGS: (workspaceId: string) => `/workspaces/${workspaceId}/analytics/audit-logs`,
    EXPORT: (workspaceId: string) => `/workspaces/${workspaceId}/analytics/export`,
  },
  BILLING: {
    ACCOUNT: (workspaceId: string) => `/workspaces/${workspaceId}/billing/account`,
    PLAN: (workspaceId: string) => `/workspaces/${workspaceId}/billing/plan`,
    INVOICES: (workspaceId: string) => `/workspaces/${workspaceId}/billing/invoices`,
    USAGE: (workspaceId: string) => `/workspaces/${workspaceId}/billing/usage`,
  },
  PROMPTS: {
    TEMPLATES: (workspaceId: string) => `/workspaces/${workspaceId}/prompts/templates`,
    TEMPLATE_DETAIL: (workspaceId: string, templateId: string) => `/workspaces/${workspaceId}/prompts/templates/${templateId}`,
    EXECUTE: (workspaceId: string) => `/workspaces/${workspaceId}/prompts/execute`,
    COMPARE: (workspaceId: string) => `/workspaces/${workspaceId}/prompts/compare`,
    EXECUTIONS: (workspaceId: string) => `/workspaces/${workspaceId}/prompts/executions`,
  },
  TRAINING: {
    DATASETS: (workspaceId: string) => `/workspaces/${workspaceId}/training/datasets`,
    JOBS: (workspaceId: string) => `/workspaces/${workspaceId}/training/jobs`,
    JOB_DETAIL: (workspaceId: string, jobId: string) => `/workspaces/${workspaceId}/training/jobs/${jobId}`,
    JOB_LOGS: (workspaceId: string, jobId: string) => `/workspaces/${workspaceId}/training/jobs/${jobId}/logs`,
    JOB_CANCEL: (workspaceId: string, jobId: string) => `/workspaces/${workspaceId}/training/jobs/${jobId}/cancel`,
    JOB_RETRY: (workspaceId: string, jobId: string) => `/workspaces/${workspaceId}/training/jobs/${jobId}/retry`,
  },
  WIDGET: {
    CONFIG: (workspaceId: string, agentId: string) => `/workspaces/${workspaceId}/agents/${agentId}/widget`,
    PUBLISH: (workspaceId: string, widgetId: string) => `/workspaces/${workspaceId}/widgets/${widgetId}/publish`,
    TOKEN: (workspaceId: string, widgetId: string) => `/workspaces/${workspaceId}/widgets/${widgetId}/token`,
  },
  NOTIFICATIONS: {
    LIST: "/notifications",
    UNREAD_COUNT: "/notifications/unread-count",
    READ_ALL: "/notifications/read-all",
    READ: (notificationId: string) => `/notifications/${notificationId}/read`,
    DETAIL: (notificationId: string) => `/notifications/${notificationId}`,
    PREFERENCES: "/notifications/preferences",
  },
  ADMIN: {
    STATS: "/admin/stats",
    TELEMETRY: "/admin/telemetry",
    USERS: "/admin/users",
    USER_DETAIL: (userId: string) => `/admin/users/${userId}`,
    USER_ROLE: (userId: string) => `/admin/users/${userId}/role`,
    WORKSPACES: "/admin/workspaces",
    LOGS: "/admin/logs",
  },
} as const;
