import { useState, useEffect, useRef, useMemo } from "react";
import { motion, type Variants, useInView } from "framer-motion";
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

const PRIMARY = "#6C5CE7";
const SECONDARY = "#8B5CF6";
const ACCENT = "#A78BFA";

const AGENT_COLORS = [
  "#10B981",
  "#6C5CE7",
  "#8B5CF6",
  "#06B6D4",
  "#F59E0B",
  "#EC4899",
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

// ── Animated Number ───────────────────────────────────────────────
function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  duration = 800,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const start = 0;
    const end = value;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value, duration, isInView]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────
function Sparkline({
  data,
  color = PRIMARY,
  className,
}: {
  data: number[];
  color?: string;
  className?: string;
}) {
  if (!data.length) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 32;
  const padding = 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathD = `M${points.join(" L")}`;
  const areaD = `${pathD} L${width - padding},${height} L${padding},${height} Z`;
  const gradientId = `spark-${color.replace("#", "")}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.path
        d={areaD}
        fill={`url(#${gradientId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
      />
      <motion.circle
        cx={width - padding}
        cy={
          height -
          padding -
          ((data[data.length - 1] - min) / range) * (height - padding * 2)
        }
        r={3}
        fill={color}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 300 }}
      />
      <motion.circle
        cx={width - padding}
        cy={
          height -
          padding -
          ((data[data.length - 1] - min) / range) * (height - padding * 2)
        }
        r={6}
        fill={color}
        opacity={0.2}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ delay: 1.2, duration: 0.6 }}
      />
    </svg>
  );
}

// ── Premium Chart Tooltip ─────────────────────────────────────────
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
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl px-3.5 py-2.5 shadow-xl"
    >
      <p className="text-[11px] font-medium text-muted-foreground mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">{entry.name}</span>
          <span className="text-sm font-bold ml-auto" style={{ color: entry.color }}>
            {formatNumber(entry.value)}
          </span>
        </div>
      ))}
    </motion.div>
  );
};

// ── Donut Center ──────────────────────────────────────────────────
function DonutCenter({ total }: { total: number }) {
  return (
    <text
      x="50%"
      y="48%"
      textAnchor="middle"
      dominantBaseline="central"
      fill="var(--color-foreground)"
    >
      <tspan fontSize="22" fontWeight="700" dy="-2" fill="var(--color-foreground)">
        {formatNumber(total)}
      </tspan>
      <tspan
        fontSize="10"
        fontWeight="500"
        dy="16"
        fill="var(--color-muted-foreground)"
      >
        Total
      </tspan>
    </text>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────
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

  const sparkData = useMemo(() => ({
    agents: agents.map(() => 1),
    conversations: usageData.map((u) => u.chats),
    messages: usageData.map((u) => u.chats),
    tokens: usageData.map((u) => u.tokens),
    cost: usageData.map((u) => u.costUsd),
    latency: usageData.map((u) => u.avgLatencyMs),
    knowledge: [1, 2, 3, 4, 5],
    active: [activeAgents.length],
  }), [agents, usageData, activeAgents.length]);

  const kpiCards = [
    {
      label: "Total Agents",
      numericValue: agents.length,
      value: formatNumber(agents.length),
      icon: Bot,
      trend: "up" as const,
      change: `${activeAgents.length} active`,
      color: "#6C5CE7",
      colorClass: "from-indigo-500/15 to-violet-500/15 text-indigo-600",
      sparkColor: "#6C5CE7",
      spark: sparkData.agents,
    },
    {
      label: "Total Conversations",
      numericValue: overview?.totalChats ?? 0,
      value: formatNumber(overview?.totalChats ?? 0),
      icon: MessageCircle,
      trend: "up" as const,
      change: chatTrend ?? "No trend data",
      color: "#8B5CF6",
      colorClass: "from-purple-500/15 to-fuchsia-500/15 text-purple-600",
      sparkColor: "#8B5CF6",
      spark: sparkData.conversations,
    },
    {
      label: "Messages Today",
      numericValue: usage.length ? usage[usage.length - 1].chats : 0,
      value: formatNumber(usage.length ? usage[usage.length - 1].chats : 0),
      icon: MessageSquare,
      trend: "up" as const,
      change: "Today",
      color: "#A78BFA",
      colorClass: "from-violet-500/15 to-indigo-500/15 text-violet-600",
      sparkColor: "#A78BFA",
      spark: sparkData.messages,
    },
    {
      label: "Token Usage",
      numericValue: overview?.totalTokens ?? 0,
      value: formatNumber(overview?.totalTokens ?? 0),
      icon: Coins,
      trend: "up" as const,
      change: tokenTrend ?? "No trend data",
      color: "#3B82F6",
      colorClass: "from-blue-500/15 to-cyan-500/15 text-blue-600",
      sparkColor: "#3B82F6",
      spark: sparkData.tokens,
    },
    {
      label: "Monthly Cost",
      numericValue: overview?.totalCostUsd ?? 0,
      value: formatCurrency(overview?.totalCostUsd ?? 0),
      icon: DollarSign,
      trend: "up" as const,
      change: costTrend ?? "No trend data",
      color: "#10B981",
      colorClass: "from-emerald-500/15 to-green-500/15 text-emerald-600",
      sparkColor: "#10B981",
      spark: sparkData.cost,
      isCurrency: true,
    },
    {
      label: "Avg Response Time",
      numericValue: Math.round((overview?.avgLatencyMs ?? 0) / 1000 * 10) / 10,
      value: `${((overview?.avgLatencyMs ?? 0) / 1000).toFixed(1)}s`,
      icon: Timer,
      trend: latencyTrend !== null && Number(latencyTrend) < 0 ? "down" as const : "up" as const,
      change: latencyTrend ? `${latencyTrend}` : "No trend data",
      color: "#F59E0B",
      colorClass: "from-amber-500/15 to-orange-500/15 text-amber-600",
      sparkColor: "#F59E0B",
      spark: sparkData.latency,
    },
    {
      label: "Knowledge Files",
      numericValue: overview?.totalKnowledgeFiles ?? 0,
      value: formatNumber(overview?.totalKnowledgeFiles ?? 0),
      icon: FileText,
      trend: "up" as const,
      change: "Total files",
      color: "#06B6D4",
      colorClass: "from-teal-500/15 to-cyan-500/15 text-teal-600",
      sparkColor: "#06B6D4",
      spark: sparkData.knowledge,
    },
    {
      label: "Active Agents",
      numericValue: overview?.activeAgentsCount ?? 0,
      value: formatNumber(overview?.activeAgentsCount ?? 0),
      icon: Activity,
      trend: "up" as const,
      change: "Currently active",
      color: "#EC4899",
      colorClass: "from-pink-500/15 to-rose-500/15 text-pink-600",
      sparkColor: "#EC4899",
      spark: sparkData.active,
    },
  ];

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();

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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {greeting}, Imaz! <span className="inline-block animate-[float_3s_ease-in-out_infinite]">&#x1F44B;</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Here&apos;s what&apos;s happening with your AI agents today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-border/60 bg-muted/30 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-muted-foreground">
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
            <Card className="group relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {kpi.label}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">
                      {kpi.isCurrency ? (
                        <AnimatedNumber
                          value={kpi.numericValue}
                          prefix="$"
                          duration={1000}
                        />
                      ) : (
                        <AnimatedNumber value={kpi.numericValue} />
                      )}
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm",
                      kpi.colorClass
                    )}
                  >
                    <kpi.icon className="h-5 w-5" />
                  </motion.div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1">
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
                  <div className="w-20 h-8 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                    <Sparkline data={kpi.spark} color={kpi.sparkColor} />
                  </div>
                </div>
                {/* Bottom gradient line on hover */}
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                        <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={PRIMARY} stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--color-border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
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
                      dot={false}
                      activeDot={{
                        r: 5,
                        fill: PRIMARY,
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
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
                        <DonutCenter
                          total={distributionData.reduce((s, d) => s + d.value, 0)}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload as {
                              name: string;
                              value: number;
                            };
                            return (
                              <div className="rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl px-3.5 py-2.5 shadow-xl">
                                <p className="text-[11px] font-medium text-muted-foreground">
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
                      stroke="var(--color-border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      tickFormatter={(v: number) => formatNumber(v)}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-muted)", opacity: 0.3 }} />
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
                        <stop offset="0%" stopColor={ACCENT} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={ACCENT} stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--color-border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }}
                      interval={1}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
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
                      dot={false}
                      activeDot={{
                        r: 5,
                        fill: ACCENT,
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
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
                <div className="absolute left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-border via-border/50 to-transparent" />
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
                      className="relative flex gap-3 py-3 first:pt-0 last:pb-0 group/item hover:bg-muted/30 rounded-lg transition-colors px-1 -mx-1"
                    >
                      <div
                        className={cn(
                          "relative z-10 mt-1 h-[10px] w-[10px] shrink-0 rounded-full ring-4 ring-card transition-shadow group-hover/item:ring-muted/50",
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
                    <tr className="border-b border-border/60">
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
                        className="border-b border-border/30 last:border-0 transition-colors hover:bg-muted/30 group/row"
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm transition-transform group-hover/row:scale-105"
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
              className="group cursor-pointer overflow-hidden"
              onClick={() => navigate(action.path)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
                      action.gradient
                    )}
                  >
                    <action.icon className="h-5 w-5" />
                  </motion.div>
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
