export type AgentStatus = "active" | "training" | "draft" | "inactive";

export type AgentCategory =
  | "Customer Support"
  | "Sales"
  | "Development"
  | "Marketing"
  | "HR"
  | "Analytics";

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  model: string;
  status: AgentStatus;
  version: string;
  lastTraining: string;
  totalChats: number;
  createdAt: string;
  owner: string;
  avatarColor: string;
}

export type ConversationStatus = "resolved" | "active" | "pending";

export interface Conversation {
  id: string;
  agentName: string;
  userName: string;
  messagePreview: string;
  timestamp: string;
  rating: number | null;
  status: ConversationStatus;
}

export type KnowledgeFileStatus = "indexed" | "processing" | "failed";

export type KnowledgeFileType =
  | "pdf"
  | "docx"
  | "txt"
  | "csv"
  | "md"
  | "json";

export interface KnowledgeFile {
  id: string;
  name: string;
  type: KnowledgeFileType;
  status: KnowledgeFileStatus;
  chunks: number;
  size: string;
  uploadedAt: string;
}

export type DeploymentEnvironment = "production" | "staging" | "development";

export type DeploymentStatus =
  | "active"
  | "pending"
  | "failed"
  | "rolled_back";

export interface Deployment {
  id: string;
  agentName: string;
  environment: DeploymentEnvironment;
  version: string;
  status: DeploymentStatus;
  deployedAt: string;
}

export type ApiKeyPermission = "read" | "write" | "admin";

export interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  permissions: ApiKeyPermission[];
  lastUsed: string;
  createdAt: string;
}

export type InvoiceStatus = "paid" | "unpaid" | "overdue";

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
  description: string;
}

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

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const agents: Agent[] = [
  {
    id: "ag_001",
    name: "SupportBot Pro",
    description:
      "Advanced customer support agent with multi-language capabilities and sentiment analysis.",
    category: "Customer Support",
    model: "GPT-4o",
    status: "active",
    version: "3.2.1",
    lastTraining: "2026-07-20T14:30:00Z",
    totalChats: 14523,
    createdAt: "2026-01-15T09:00:00Z",
    owner: "Sarah Chen",
    avatarColor: "#6366f1",
  },
  {
    id: "ag_002",
    name: "Sales Navigator",
    description:
      "Lead qualification and nurturing agent that integrates with CRM systems.",
    category: "Sales",
    model: "GPT-4o",
    status: "active",
    version: "2.1.0",
    lastTraining: "2026-07-18T10:00:00Z",
    totalChats: 8934,
    createdAt: "2026-02-20T11:00:00Z",
    owner: "Marcus Johnson",
    avatarColor: "#a855f7",
  },
  {
    id: "ag_003",
    name: "CodeAssist",
    description:
      "AI pair programmer for code review, debugging, and documentation generation.",
    category: "Development",
    model: "Claude 3.5 Sonnet",
    status: "active",
    version: "1.8.3",
    lastTraining: "2026-07-22T08:15:00Z",
    totalChats: 22187,
    createdAt: "2026-01-05T15:30:00Z",
    owner: "Alex Rivera",
    avatarColor: "#22c55e",
  },
  {
    id: "ag_004",
    name: "Content Creator",
    description:
      "Content generation agent for blog posts, social media, and marketing copy.",
    category: "Marketing",
    model: "GPT-4o",
    status: "training",
    version: "2.0.0-beta",
    lastTraining: "2026-07-23T16:45:00Z",
    totalChats: 5671,
    createdAt: "2026-03-10T13:00:00Z",
    owner: "Priya Patel",
    avatarColor: "#f59e0b",
  },
  {
    id: "ag_005",
    name: "HR Assistant",
    description:
      "Employee onboarding, policy queries, and leave management automation.",
    category: "HR",
    model: "GPT-4o Mini",
    status: "active",
    version: "1.5.2",
    lastTraining: "2026-07-15T09:30:00Z",
    totalChats: 3456,
    createdAt: "2026-04-01T10:00:00Z",
    owner: "Diana Kim",
    avatarColor: "#ec4899",
  },
  {
    id: "ag_006",
    name: "Data Analyst",
    description:
      "Automated data analysis, visualization suggestions, and report generation.",
    category: "Analytics",
    model: "Claude 3.5 Sonnet",
    status: "active",
    version: "1.3.0",
    lastTraining: "2026-07-19T12:00:00Z",
    totalChats: 7892,
    createdAt: "2026-02-28T14:00:00Z",
    owner: "James Wright",
    avatarColor: "#06b6d4",
  },
  {
    id: "ag_007",
    name: "Lead Qualifier",
    description:
      "Automated lead scoring and qualification with pipeline integration.",
    category: "Sales",
    model: "GPT-4o Mini",
    status: "draft",
    version: "0.9.0",
    lastTraining: "2026-07-10T11:00:00Z",
    totalChats: 0,
    createdAt: "2026-07-08T16:00:00Z",
    owner: "Marcus Johnson",
    avatarColor: "#8b5cf6",
  },
  {
    id: "ag_008",
    name: "FAQ Resolver",
    description:
      "Instant FAQ responses with context-aware follow-up question handling.",
    category: "Customer Support",
    model: "GPT-4o Mini",
    status: "inactive",
    version: "1.0.0",
    lastTraining: "2026-06-15T09:00:00Z",
    totalChats: 1245,
    createdAt: "2026-05-12T08:00:00Z",
    owner: "Sarah Chen",
    avatarColor: "#14b8a6",
  },
];

export const conversations: Conversation[] = [
  {
    id: "conv_001",
    agentName: "SupportBot Pro",
    userName: "Emily Rodriguez",
    messagePreview: "I need help with my recent order #4521, it hasn't arrived yet.",
    timestamp: "2026-07-23T14:32:00Z",
    rating: 5,
    status: "resolved",
  },
  {
    id: "conv_002",
    agentName: "Sales Navigator",
    userName: "David Thompson",
    messagePreview: "I'm interested in the Enterprise plan. Can you walk me through pricing?",
    timestamp: "2026-07-23T14:15:00Z",
    rating: 4,
    status: "active",
  },
  {
    id: "conv_003",
    agentName: "CodeAssist",
    userName: "Lisa Wang",
    messagePreview: "How do I implement WebSocket connections in my React app?",
    timestamp: "2026-07-23T13:58:00Z",
    rating: 5,
    status: "resolved",
  },
  {
    id: "conv_004",
    agentName: "SupportBot Pro",
    userName: "Michael Brown",
    messagePreview: "My subscription was charged twice this month, can you help?",
    timestamp: "2026-07-23T13:45:00Z",
    rating: null,
    status: "pending",
  },
  {
    id: "conv_005",
    agentName: "HR Assistant",
    userName: "Jessica Taylor",
    messagePreview: "How many PTO days do I have left this quarter?",
    timestamp: "2026-07-23T13:20:00Z",
    rating: 4,
    status: "resolved",
  },
  {
    id: "conv_006",
    agentName: "Data Analyst",
    userName: "Robert Chen",
    messagePreview: "Can you generate a summary of our Q2 sales performance?",
    timestamp: "2026-07-23T12:50:00Z",
    rating: 5,
    status: "resolved",
  },
  {
    id: "conv_007",
    agentName: "Content Creator",
    userName: "Amanda Foster",
    messagePreview: "Write a LinkedIn post about our new AI product launch.",
    timestamp: "2026-07-23T12:30:00Z",
    rating: null,
    status: "active",
  },
  {
    id: "conv_008",
    agentName: "Sales Navigator",
    userName: "Kevin Martinez",
    messagePreview: "What's the difference between the Pro and Enterprise tiers?",
    timestamp: "2026-07-23T11:45:00Z",
    rating: 3,
    status: "resolved",
  },
  {
    id: "conv_009",
    agentName: "SupportBot Pro",
    userName: "Rachel Green",
    messagePreview: "I can't log in to my account, I keep getting an error message.",
    timestamp: "2026-07-23T11:20:00Z",
    rating: 5,
    status: "resolved",
  },
  {
    id: "conv_010",
    agentName: "CodeAssist",
    userName: "Tom Anderson",
    messagePreview: "Review my pull request and suggest improvements for error handling.",
    timestamp: "2026-07-23T10:55:00Z",
    rating: 4,
    status: "resolved",
  },
];

export const knowledgeFiles: KnowledgeFile[] = [
  {
    id: "kf_001",
    name: "ProductDocumentation_v4.pdf",
    type: "pdf",
    status: "indexed",
    chunks: 342,
    size: "12.4 MB",
    uploadedAt: "2026-07-15T09:00:00Z",
  },
  {
    id: "kf_002",
    name: "SalesPlaybook_2026.docx",
    type: "docx",
    status: "indexed",
    chunks: 189,
    size: "3.2 MB",
    uploadedAt: "2026-07-10T14:30:00Z",
  },
  {
    id: "kf_003",
    name: "FAQ_KnowledgeBase.md",
    type: "md",
    status: "indexed",
    chunks: 567,
    size: "890 KB",
    uploadedAt: "2026-07-08T11:00:00Z",
  },
  {
    id: "kf_004",
    name: "CustomerData_Q2.csv",
    type: "csv",
    status: "processing",
    chunks: 0,
    size: "24.7 MB",
    uploadedAt: "2026-07-22T16:00:00Z",
  },
  {
    id: "kf_005",
    name: "API_Reference.json",
    type: "json",
    status: "indexed",
    chunks: 234,
    size: "1.8 MB",
    uploadedAt: "2026-07-05T10:15:00Z",
  },
  {
    id: "kf_006",
    name: "CompanyPolicies.txt",
    type: "txt",
    status: "indexed",
    chunks: 98,
    size: "245 KB",
    uploadedAt: "2026-06-28T08:00:00Z",
  },
  {
    id: "kf_007",
    name: "TrainingData_CX.csv",
    type: "csv",
    status: "failed",
    chunks: 0,
    size: "56.3 MB",
    uploadedAt: "2026-07-20T13:45:00Z",
  },
  {
    id: "kf_008",
    name: "OnboardingGuide.pdf",
    type: "pdf",
    status: "indexed",
    chunks: 156,
    size: "5.6 MB",
    uploadedAt: "2026-07-01T09:30:00Z",
  },
];

export const deployments: Deployment[] = [
  {
    id: "dep_001",
    agentName: "SupportBot Pro",
    environment: "production",
    version: "3.2.1",
    status: "active",
    deployedAt: "2026-07-20T14:30:00Z",
  },
  {
    id: "dep_002",
    agentName: "Sales Navigator",
    environment: "production",
    version: "2.1.0",
    status: "active",
    deployedAt: "2026-07-18T10:00:00Z",
  },
  {
    id: "dep_003",
    agentName: "SupportBot Pro",
    environment: "staging",
    version: "3.3.0-beta",
    status: "pending",
    deployedAt: "2026-07-22T16:00:00Z",
  },
  {
    id: "dep_004",
    agentName: "CodeAssist",
    environment: "production",
    version: "1.8.3",
    status: "active",
    deployedAt: "2026-07-22T08:15:00Z",
  },
  {
    id: "dep_005",
    agentName: "HR Assistant",
    environment: "development",
    version: "1.6.0-dev",
    status: "failed",
    deployedAt: "2026-07-21T11:30:00Z",
  },
];

export const apiKeys: ApiKey[] = [
  {
    id: "ak_001",
    name: "Production API Key",
    keyPreview: "af_prod_****...x8Kq",
    permissions: ["read", "write"],
    lastUsed: "2026-07-23T14:00:00Z",
    createdAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "ak_002",
    name: "Development Key",
    keyPreview: "af_dev_****...m3Rn",
    permissions: ["read", "write", "admin"],
    lastUsed: "2026-07-23T12:30:00Z",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "ak_003",
    name: "Read-Only Analytics",
    keyPreview: "af_read_****...pQ7w",
    permissions: ["read"],
    lastUsed: "2026-07-22T09:15:00Z",
    createdAt: "2026-05-10T14:00:00Z",
  },
];

export const invoices: Invoice[] = [
  {
    id: "inv_001",
    date: "2026-07-01T00:00:00Z",
    amount: 2499.0,
    status: "paid",
    description: "July 2026 - Enterprise Plan",
  },
  {
    id: "inv_002",
    date: "2026-06-01T00:00:00Z",
    amount: 2499.0,
    status: "paid",
    description: "June 2026 - Enterprise Plan",
  },
  {
    id: "inv_003",
    date: "2026-05-01T00:00:00Z",
    amount: 1999.0,
    status: "paid",
    description: "May 2026 - Pro Plan",
  },
  {
    id: "inv_004",
    date: "2026-04-01T00:00:00Z",
    amount: 1999.0,
    status: "paid",
    description: "April 2026 - Pro Plan",
  },
  {
    id: "inv_005",
    date: "2026-03-01T00:00:00Z",
    amount: 999.0,
    status: "overdue",
    description: "March 2026 - Starter Plan",
  },
  {
    id: "inv_006",
    date: "2026-02-01T00:00:00Z",
    amount: 999.0,
    status: "paid",
    description: "February 2026 - Starter Plan",
  },
];

export const dashboardStats: DashboardStats = {
  totalAgents: 8,
  activeChats: 47,
  totalConversations: 64308,
  totalTokens: 12_450_000,
  monthlyCost: 2499.0,
  uptime: 99.97,
  avgResponseTime: 1.2,
  satisfactionScore: 4.8,
};

export const monthlyUsage: MonthlyUsage[] = [
  { month: "Aug", conversations: 3200, tokens: 890_000, cost: 180 },
  { month: "Sep", conversations: 4100, tokens: 1_120_000, cost: 230 },
  { month: "Oct", conversations: 5300, tokens: 1_450_000, cost: 295 },
  { month: "Nov", conversations: 6200, tokens: 1_680_000, cost: 340 },
  { month: "Dec", conversations: 4800, tokens: 1_320_000, cost: 270 },
  { month: "Jan", conversations: 7100, tokens: 1_950_000, cost: 395 },
  { month: "Feb", conversations: 8500, tokens: 2_340_000, cost: 475 },
  { month: "Mar", conversations: 9200, tokens: 2_530_000, cost: 510 },
  { month: "Apr", conversations: 10_800, tokens: 2_970_000, cost: 600 },
  { month: "May", conversations: 11_500, tokens: 3_160_000, cost: 640 },
  { month: "Jun", conversations: 12_300, tokens: 3_380_000, cost: 685 },
  { month: "Jul", conversations: 13_400, tokens: 3_690_000, cost: 745 },
];

export const agentDistribution: AgentDistribution[] = [
  { name: "Customer Support", value: 15768, color: "#6366f1" },
  { name: "Sales", value: 8934, color: "#a855f7" },
  { name: "Development", value: 22187, color: "#22c55e" },
  { name: "Marketing", value: 5671, color: "#f59e0b" },
  { name: "HR", value: 3456, color: "#ec4899" },
  { name: "Analytics", value: 7892, color: "#06b6d4" },
];

export const activityTimeline: ActivityTimelineItem[] = [
  {
    id: "at_001",
    type: "deployment",
    message: "SupportBot Pro v3.2.1 deployed to production",
    time: "2026-07-23T14:30:00Z",
  },
  {
    id: "at_002",
    type: "training",
    message: "Content Creator training started with 2,400 new samples",
    time: "2026-07-23T13:15:00Z",
  },
  {
    id: "at_003",
    type: "knowledge_update",
    message: "CustomerData_Q2.csv uploaded and processing",
    time: "2026-07-23T12:00:00Z",
  },
  {
    id: "at_004",
    type: "agent_created",
    message: "New agent 'Lead Qualifier' created by Marcus Johnson",
    time: "2026-07-23T11:00:00Z",
  },
  {
    id: "at_005",
    type: "config_change",
    message: "SupportBot Pro temperature adjusted to 0.3",
    time: "2026-07-23T10:30:00Z",
  },
  {
    id: "at_006",
    type: "user_signup",
    message: "3 new team members joined the workspace",
    time: "2026-07-23T09:00:00Z",
  },
  {
    id: "at_007",
    type: "alert",
    message: "HR Assistant deployment to development failed",
    time: "2026-07-22T16:00:00Z",
  },
  {
    id: "at_008",
    type: "billing",
    message: "Invoice #INV-005 is now overdue ($999.00)",
    time: "2026-07-22T08:00:00Z",
  },
  {
    id: "at_009",
    type: "knowledge_update",
    message: "FAQ_KnowledgeBase.md re-indexed with 567 chunks",
    time: "2026-07-21T14:30:00Z",
  },
  {
    id: "at_010",
    type: "deployment",
    message: "CodeAssist v1.8.3 deployed to production",
    time: "2026-07-22T08:15:00Z",
  },
];

export const notifications: Notification[] = [
  {
    id: "notif_001",
    type: "warning",
    title: "Overdue Invoice",
    message: "Invoice #INV-005 ($999.00) is past due. Please update your payment method.",
    time: "2026-07-22T08:00:00Z",
    read: false,
  },
  {
    id: "notif_002",
    type: "error",
    title: "Deployment Failed",
    message: "HR Assistant deployment to development environment failed. Check logs for details.",
    time: "2026-07-22T16:00:00Z",
    read: false,
  },
  {
    id: "notif_003",
    type: "success",
    title: "Training Complete",
    message: "Sales Navigator v2.1.0 training completed successfully. 98.2% accuracy achieved.",
    time: "2026-07-22T10:00:00Z",
    read: true,
  },
  {
    id: "notif_004",
    type: "info",
    title: "New Feature Available",
    message: "Multi-language support is now available for all agents. Enable in settings.",
    time: "2026-07-21T09:00:00Z",
    read: true,
  },
  {
    id: "notif_005",
    type: "warning",
    title: "High Token Usage",
    message: "Your token usage is approaching the monthly limit. Consider upgrading your plan.",
    time: "2026-07-20T15:00:00Z",
    read: true,
  },
  {
    id: "notif_006",
    type: "success",
    title: "Milestone Reached",
    message: "Congratulations! Your agents have processed over 60,000 conversations.",
    time: "2026-07-19T12:00:00Z",
    read: true,
  },
];
