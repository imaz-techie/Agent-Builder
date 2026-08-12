import { motion, type Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  MessageSquare,
  MessageCircle,
  Coins,
  DollarSign,
  Timer,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Upload,
  BarChart3,
  Plus,
  ChevronRight,
  FileText,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatNumber,
  formatCurrency,
  formatRelativeTime,
  getStatusColor,
  cn,
} from "@/lib/utils";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAgentsQuery } from "@/hooks/queries/useAgentQueries";
import {
  useOverviewQuery,
  useUsageQuery,
  useAgentPerformanceQuery,
  useAuditLogsQuery,
} from "@/hooks/queries/useAnalyticsQueries";
import { formatModelLabel } from "@/types/agent.types";

const PRIMARY = "#6366f1";
const SECONDARY = "#8b5cf6";
const ACCENT = "#a78bfa";

const AGENT_COLORS = [
  "#22c55e",
  "#6366f1",
  "#a855f7",
  "#06b6d4",
  "#f59e0b",
  "#ec4899",
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const activityDotColor: Record<string, string> = {
  deployment: "bg-emerald-500",
  training: "bg-blue-500",
  knowledge: "bg-indigo-500",
  agent: "bg-violet-500",
  config: "bg-amber-500",
  user: "bg-teal-500",
  billing: "bg-orange-500",
  workspace: "bg-fuchsia-500",
  auth: "bg-rose-500",
};

function dotColorForAction(action: string): string {
  const lower = action.toLowerCase();
  for (const key of Object.keys(activityDotColor)) {
    if (lower.includes(key)) return activityDotColor[key];
  }
  return "bg-muted-foreground";
}

function pctChange(values: number[]): string | null {
  if (values.length < 2) return null;
  const first = values[0];
  const last = values[values.length - 1];
  if (first === 0) return last > 0 ? "new" : null;
  const delta = ((last - first) / first) * 100;
  return `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {formatNumber(entry.value)}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: agents = [], isLoading: isLoadingAgents } = useAgentsQuery();
  const { data: overview } = useOverviewQuery();
  const { data: usage = [] } = useUsageQuery();
  const { data: agentPerformance = [] } = useAgentPerformanceQuery();
  const { data: auditLogs = [] } = useAuditLogsQuery();

  const activeAgents = agents.filter((a) => a.status === "ACTIVE");

  const usageData = usage.map((u) => ({
    date: u.date,
    chats: u.chats,
    tokens: u.tokens,
    costUsd: u.costUsd,
    avgLatencyMs: u.avgLatencyMs,
  }));

  const distributionData = agentPerformance.map((a, i) => ({
    name: a.agentName,
    value: a.totalChats,
    color: AGENT_COLORS[i % AGENT_COLORS.length],
  }));

  const chatTrend = pctChange(usageData.map((u) => u.chats));
  const tokenTrend = pctChange(usageData.map((u) => u.tokens));
  const costTrend = pctChange(usageData.map((u) => u.costUsd));
  const latencyTrend = pctChange(usageData.map((u) => u.avgLatencyMs));

  const kpiCards = [
    {
      label: "Total Agents",
      value: formatNumber(agents.length),
      icon: Bot,
      trend: "up" as const,
      change: `${activeAgents.length} active`,
      color: "bg-indigo-500/10 text-indigo-600",
    },
    {
      label: "Total Conversations",
      value: formatNumber(overview?.totalChats ?? 0),
      icon: MessageCircle,
      trend: "up" as const,
      change: chatTrend ?? "No trend data",
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      label: "Messages Today",
      value: formatNumber(usage.length ? usage[usage.length - 1].chats : 0),
      icon: MessageSquare,
      trend: "up" as const,
      change: "Today",
      color: "bg-violet-500/10 text-violet-600",
    },
    {
      label: "Token Usage",
      value: formatNumber(overview?.totalTokens ?? 0),
      icon: Coins,
      trend: "up" as const,
      change: tokenTrend ?? "No trend data",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Monthly Cost",
      value: formatCurrency(overview?.totalCostUsd ?? 0),
      icon: DollarSign,
      trend: "up" as const,
      change: costTrend ?? "No trend data",
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Avg Response Time",
      value: `${((overview?.avgLatencyMs ?? 0) / 1000).toFixed(1)}s`,
      icon: Timer,
      trend: latencyTrend !== null && Number(latencyTrend) < 0 ? "down" as const : "up" as const,
      change: latencyTrend ? `${latencyTrend}` : "No trend data",
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "Knowledge Files",
      value: formatNumber(overview?.totalKnowledgeFiles ?? 0),
      icon: FileText,
      trend: "up" as const,
      change: "Total files",
      color: "bg-teal-500/10 text-teal-600",
    },
    {
      label: "Active Agents",
      value: formatNumber(overview?.activeAgentsCount ?? 0),
      icon: Activity,
      trend: "up" as const,
      change: "Currently active",
      color: "bg-fuchsia-500/10 text-fuchsia-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Page Header ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time overview of your AI agents and platform activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Last 7 days
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => navigate("/analytics")}>
            <TrendingUp className="h-4 w-4" />
            View Report
          </Button>
        </div>
      </motion.div>

      {isLoadingAgents && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* ── KPI Cards ──────────────────────────────────────── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {kpiCards.map((kpi) => (
          <motion.div key={kpi.label} variants={item}>
            <Card className="group relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {kpi.label}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">
                      {kpi.value}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                      kpi.color
                    )}
                  >
                    <kpi.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1">
                  {kpi.trend === "up" ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                  <span className="text-xs font-semibold text-emerald-600">
                    {kpi.change}
                  </span>
                  {kpi.change.includes("%") && (
                    <span className="text-xs text-muted-foreground">
                      over period
                    </span>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Charts Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Conversation Trend – spans 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="xl:col-span-2"
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Conversation Trend</CardTitle>
                <Badge variant="secondary" className="text-[10px] font-medium">
                  7 days
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={usageData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="gradientConv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={PRIMARY} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(v: number) => formatNumber(v)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="chats"
                      name="Conversations"
                      stroke={PRIMARY}
                      strokeWidth={2.5}
                      fill="url(#gradientConv)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Agent Distribution – Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Agent Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {distributionData.length === 0 ? (
                <p className="text-sm text-muted-foreground py-16 text-center">
                  No agent activity to display.
                </p>
              ) : (
                <>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {distributionData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload as {
                              name: string;
                              value: number;
                            };
                            return (
                              <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl">
                                <p className="text-xs font-medium text-muted-foreground">
                                  {d.name}
                                </p>
                                <p className="text-sm font-bold">
                                  {formatNumber(d.value)} chats
                                </p>
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5">
                    {distributionData.map((d) => (
                      <div key={d.name} className="flex items-center gap-2 text-xs">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: d.color }}
                        />
                        <span className="text-muted-foreground truncate">
                          {d.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Second Charts Row ──────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Token Consumption Bar Chart – spans 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="xl:col-span-2"
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Token Consumption</CardTitle>
                <Badge variant="secondary" className="text-[10px] font-medium">
                  7 days
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={usageData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={SECONDARY} stopOpacity={1} />
                        <stop offset="100%" stopColor={ACCENT} stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(v: number) => formatNumber(v)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="tokens"
                      name="Tokens"
                      fill="url(#gradientBar)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Cost – Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Daily Cost (USD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={usageData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={ACCENT} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                      interval={1}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(v: number) => `$${v.toFixed(2)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="costUsd"
                      name="Cost"
                      stroke={ACCENT}
                      strokeWidth={2}
                      fill="url(#gradientArea)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Activity Timeline + Recent Agents ──────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="xl:col-span-1"
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Activity Timeline</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary gap-0.5"
                  onClick={() => navigate("/analytics")}
                >
                  View all <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-0">
                <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />
                {auditLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-12 text-center">
                    No recent activity.
                  </p>
                ) : (
                  auditLogs.slice(0, 8).map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 + i * 0.05 }}
                      className="relative flex gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div
                        className={cn(
                          "relative z-10 mt-1 h-[10px] w-[10px] shrink-0 rounded-full ring-4 ring-card",
                          dotColorForAction(entry.action)
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug line-clamp-2 capitalize">
                          {entry.action.replace(/_/g, " ")}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {formatRelativeTime(entry.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Agents Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="xl:col-span-2"
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Agents</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary gap-0.5"
                  onClick={() => navigate("/agents")}
                >
                  View all <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 font-medium text-muted-foreground">
                        Agent
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
                        Model
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground text-right">
                        Chats
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
                        Last Trained
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.slice(0, 5).map((agent) => (
                      <tr
                        key={agent.id}
                        className="border-b border-border/50 last:border-0 transition-colors hover:bg-muted/40"
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                              style={{ backgroundColor: agent.avatarColor }}
                            >
                              {agent.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{agent.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {agent.category}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {formatModelLabel(agent.model)}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] capitalize",
                              getStatusColor(agent.status)
                            )}
                          >
                            {agent.status.toLowerCase()}
                          </Badge>
                        </td>
                        <td className="py-3 text-right font-medium">
                          {formatNumber(agent.totalChats)}
                        </td>
                        <td className="py-3 text-muted-foreground text-xs whitespace-nowrap">
                          {agent.lastTrainingAt
                            ? formatRelativeTime(agent.lastTrainingAt)
                            : "Never"}
                        </td>
                      </tr>
                    ))}
                    {agents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                          No agents yet. Create your first agent to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Quick Actions ──────────────────────────────────── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          {
            label: "Create Agent",
            desc: "Build a new AI agent from scratch.",
            icon: Plus,
            gradient: "from-indigo-500 to-violet-500",
            path: "/agents/new",
          },
          {
            label: "Upload Knowledge",
            desc: "Add documents to train your agents.",
            icon: Upload,
            gradient: "from-violet-500 to-purple-500",
            path: "/knowledge",
          },
          {
            label: "Deploy Widget",
            desc: "Embed the chat widget on your site.",
            icon: Zap,
            gradient: "from-purple-500 to-fuchsia-500",
            path: "/embed",
          },
          {
            label: "View Analytics",
            desc: "Deep-dive into usage analytics.",
            icon: BarChart3,
            gradient: "from-fuchsia-500 to-pink-500",
            path: "/analytics",
          },
        ].map((action) => (
          <motion.div key={action.label} variants={item}>
            <Card
              className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300"
              onClick={() => navigate(action.path)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
                      action.gradient
                    )}
                  >
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold">{action.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {action.desc}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
