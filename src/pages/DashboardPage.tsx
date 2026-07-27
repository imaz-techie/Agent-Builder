import { motion, type Variants } from "framer-motion";
import {
  Bot,
  MessageSquare,
  MessageCircle,
  Coins,
  DollarSign,
  Timer,
  CheckCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Upload,
  BarChart3,
  Plus,
  ChevronRight,
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
  agents,
  activityTimeline,
  agentDistribution,
  monthlyUsage,
} from "@/lib/mock-data";
import {
  formatNumber,
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

const PRIMARY = "#6366f1";
const SECONDARY = "#8b5cf6";
const ACCENT = "#a78bfa";

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

const kpiCards = [
  {
    label: "Total Agents",
    value: "8",
    icon: Bot,
    trend: "up",
    change: "+2",
    color: "bg-indigo-500/10 text-indigo-600",
  },
  {
    label: "Active Chats",
    value: "342",
    icon: MessageSquare,
    trend: "up",
    change: "+12%",
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    label: "Total Conversations",
    value: "15,847",
    icon: MessageCircle,
    trend: "up",
    change: "+8.3%",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    label: "Requests Today",
    value: "2,341",
    icon: Activity,
    trend: "up",
    change: "+15%",
    color: "bg-fuchsia-500/10 text-fuchsia-600",
  },
  {
    label: "Token Usage",
    value: "2.4M",
    icon: Coins,
    trend: "up",
    change: "+18%",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    label: "Monthly Cost",
    value: "$1,247",
    icon: DollarSign,
    trend: "up",
    change: "+5%",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    label: "Avg Response Time",
    value: "0.8s",
    icon: Timer,
    trend: "down",
    change: "-0.2s",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    label: "Success Rate",
    value: "98.7%",
    icon: CheckCircle,
    trend: "up",
    change: "+0.3%",
    color: "bg-teal-500/10 text-teal-600",
  },
];

const requestsByHour = [
  { hour: "12am", requests: 45 },
  { hour: "1am", requests: 32 },
  { hour: "2am", requests: 28 },
  { hour: "3am", requests: 18 },
  { hour: "4am", requests: 12 },
  { hour: "5am", requests: 15 },
  { hour: "6am", requests: 38 },
  { hour: "7am", requests: 72 },
  { hour: "8am", requests: 145 },
  { hour: "9am", requests: 210 },
  { hour: "10am", requests: 278 },
  { hour: "11am", requests: 312 },
  { hour: "12pm", requests: 265 },
  { hour: "1pm", requests: 298 },
  { hour: "2pm", requests: 285 },
  { hour: "3pm", requests: 310 },
  { hour: "4pm", requests: 265 },
  { hour: "5pm", requests: 195 },
  { hour: "6pm", requests: 142 },
  { hour: "7pm", requests: 110 },
  { hour: "8pm", requests: 88 },
  { hour: "9pm", requests: 75 },
  { hour: "10pm", requests: 62 },
  { hour: "11pm", requests: 48 },
];

const activityDotColor: Record<string, string> = {
  deployment: "bg-emerald-500",
  training: "bg-blue-500",
  knowledge_update: "bg-indigo-500",
  agent_created: "bg-violet-500",
  config_change: "bg-amber-500",
  user_signup: "bg-teal-500",
  billing: "bg-orange-500",
  alert: "bg-red-500",
};

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
  const activeAgents = agents.filter((a) => a.status === "active");

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
            Jul 1 &ndash; Jul 27, 2026
          </div>
          <Button size="sm" className="gap-1.5">
            <TrendingUp className="h-4 w-4" />
            View Report
          </Button>
        </div>
      </motion.div>

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
                  <span className="text-xs text-muted-foreground">
                    from last month
                  </span>
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
                  12 months
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyUsage}
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
                      dataKey="month"
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
                      dataKey="conversations"
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
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={agentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {agentDistribution.map((entry, i) => (
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
                {agentDistribution.map((d) => (
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
                  12 months
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyUsage}
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
                      dataKey="month"
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

        {/* Requests by Hour – Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Requests by Hour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={requestsByHour}
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
                      dataKey="hour"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                      interval={2}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="requests"
                      name="Requests"
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
                <Button variant="ghost" size="sm" className="text-xs text-primary gap-0.5">
                  View all <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-0">
                <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />
                {activityTimeline.slice(0, 8).map((entry, i) => {
                  const dotColor =
                    activityDotColor[entry.type] || "bg-muted-foreground";
                  return (
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
                          dotColor
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug line-clamp-2">
                          {entry.message}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {formatRelativeTime(entry.time)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
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
                <Button variant="ghost" size="sm" className="text-xs text-primary gap-0.5">
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
                        Last Active
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeAgents.slice(0, 5).map((agent) => (
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
                          {agent.model}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] capitalize",
                              getStatusColor(agent.status)
                            )}
                          >
                            {agent.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-right font-medium">
                          {formatNumber(agent.totalChats)}
                        </td>
                        <td className="py-3 text-muted-foreground text-xs whitespace-nowrap">
                          {formatRelativeTime(agent.lastTraining)}
                        </td>
                      </tr>
                    ))}
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
          },
          {
            label: "Upload Knowledge",
            desc: "Add documents to train your agents.",
            icon: Upload,
            gradient: "from-violet-500 to-purple-500",
          },
          {
            label: "Deploy Widget",
            desc: "Embed the chat widget on your site.",
            icon: Zap,
            gradient: "from-purple-500 to-fuchsia-500",
          },
          {
            label: "View Analytics",
            desc: "Deep-dive into usage analytics.",
            icon: BarChart3,
            gradient: "from-fuchsia-500 to-pink-500",
          },
        ].map((action) => (
          <motion.div key={action.label} variants={item}>
            <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300">
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
