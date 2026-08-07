import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Clock,
  Coins,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useOverviewQuery,
  useUsageQuery,
  useAgentPerformanceQuery,
} from "@/hooks/queries/useAnalyticsQueries";
import { formatNumber, formatCurrency, formatDate } from "@/lib/utils";

const AGENT_COLORS = [
  "#22c55e",
  "#6366f1",
  "#a855f7",
  "#06b6d4",
  "#f59e0b",
  "#ec4899",
];

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
    <div className="rounded-lg border border-border bg-card p-2 shadow-lg text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium">{formatNumber(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7d");
  const { data: overview, isLoading, isError } = useOverviewQuery();
  const { data: usage = [] } = useUsageQuery();
  const { data: agentPerformance = [] } = useAgentPerformanceQuery();

  const dailyData = usage.map((u) => ({
    day: formatDate(u.date, { month: "short", day: "numeric" }),
    conversations: u.chats,
    tokens: u.tokens,
    costUsd: u.costUsd,
  }));

  const tokenLineData = usage.map((u) => ({
    month: formatDate(u.date, { month: "short", day: "numeric" }),
    inputTokens: Math.floor(u.tokens * 0.6),
    outputTokens: Math.floor(u.tokens * 0.4),
  }));

  const topAgentsData = agentPerformance.map((a, i) => ({
    name: a.agentName,
    conversations: a.totalChats,
    color: AGENT_COLORS[i % AGENT_COLORS.length],
  }));

  const statCards = [
    {
      label: "Total Conversations",
      value: formatNumber(overview?.totalChats ?? 0),
      change: "+8.3%",
      up: true,
      icon: MessageSquare,
      color: "text-primary",
    },
    {
      label: "Avg Response Time",
      value: `${((overview?.avgLatencyMs ?? 0) / 1000).toFixed(1)}s`,
      change: "-0.2s",
      up: false,
      icon: Clock,
      color: "text-info",
    },
    {
      label: "Token Usage",
      value: formatNumber(overview?.totalTokens ?? 0),
      change: "+15%",
      up: true,
      icon: Coins,
      color: "text-secondary",
    },
    {
      label: "Est. Monthly Cost",
      value: formatCurrency(overview?.totalCostUsd ?? 0),
      change: "+0.4%",
      up: true,
      icon: DollarSign,
      color: "text-success",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Executive insights into your agents performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && !isLoading && (
        <div className="rounded-lg border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Failed to load analytics. Please check your connection.
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {stat.up ? (
                            <ArrowUpRight className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <ArrowDownRight className="h-3.5 w-3.5 text-success" />
                          )}
                          <span className="text-xs font-medium text-success">
                            {stat.change}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            vs last month
                          </span>
                        </div>
                      </div>
                      <div
                        className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}
                      >
                        <stat.icon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Daily Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={dailyData}>
                      <defs>
                        <linearGradient
                          id="colorConversations"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                      />
                      <XAxis
                        dataKey="day"
                        tick={{
                          fontSize: 10,
                          fill: "var(--color-muted-foreground)",
                        }}
                        tickLine={false}
                        axisLine={false}
                        interval={1}
                      />
                      <YAxis
                        tick={{
                          fontSize: 10,
                          fill: "var(--color-muted-foreground)",
                        }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: number) => formatNumber(v)}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="conversations"
                        name="Conversations"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fill="url(#colorConversations)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Daily Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={dailyData}>
                      <defs>
                        <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={1} />
                          <stop
                            offset="95%"
                            stopColor="#6366f1"
                            stopOpacity={0.8}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                      />
                      <XAxis
                        dataKey="day"
                        tick={{
                          fontSize: 10,
                          fill: "var(--color-muted-foreground)",
                        }}
                        tickLine={false}
                        axisLine={false}
                        interval={1}
                      />
                      <YAxis
                        tick={{
                          fontSize: 10,
                          fill: "var(--color-muted-foreground)",
                        }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: number) => formatNumber(v)}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="tokens"
                        name="Tokens"
                        fill="url(#colorUsage)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Token Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={tokenLineData}>
                      <defs>
                        <linearGradient id="colorInput" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="5%" stopColor="#22c55e" />
                          <stop offset="95%" stopColor="#06b6d4" />
                        </linearGradient>
                        <linearGradient
                          id="colorOutput"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="5%" stopColor="#f59e0b" />
                          <stop offset="95%" stopColor="#ef4444" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                      />
                      <XAxis
                        dataKey="month"
                        tick={{
                          fontSize: 10,
                          fill: "var(--color-muted-foreground)",
                        }}
                        tickLine={false}
                        axisLine={false}
                        interval={1}
                      />
                      <YAxis
                        tick={{
                          fontSize: 10,
                          fill: "var(--color-muted-foreground)",
                        }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: number) => formatNumber(v)}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="inputTokens"
                        name="Input Tokens"
                        stroke="url(#colorInput)"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="outputTokens"
                        name="Output Tokens"
                        stroke="url(#colorOutput)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Daily Cost (USD)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={dailyData}>
                      <defs>
                        <linearGradient
                          id="colorCost"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                      />
                      <XAxis
                        dataKey="day"
                        tick={{
                          fontSize: 10,
                          fill: "var(--color-muted-foreground)",
                        }}
                        tickLine={false}
                        axisLine={false}
                        interval={1}
                      />
                      <YAxis
                        tick={{
                          fontSize: 10,
                          fill: "var(--color-muted-foreground)",
                        }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: number) => `$${v.toFixed(2)}`}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          const p = payload[0].payload as { costUsd: number };
                          return (
                            <div className="rounded-lg border border-border bg-card p-2 shadow-lg text-xs">
                              <p className="font-medium mb-1">{label}</p>
                              <p className="text-muted-foreground">
                                Cost:{" "}
                                <span className="font-medium text-foreground">
                                  {formatCurrency(p.costUsd)}
                                </span>
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="costUsd"
                        name="Cost"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fill="url(#colorCost)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Agents</CardTitle>
              </CardHeader>
              <CardContent>
                {topAgentsData.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-12 text-center">
                    No agent activity to display.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={topAgentsData}
                      layout="vertical"
                      margin={{ left: 80 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        tick={{
                          fontSize: 10,
                          fill: "var(--color-muted-foreground)",
                        }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: number) => formatNumber(v)}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{
                          fontSize: 11,
                          fill: "var(--color-muted-foreground)",
                        }}
                        tickLine={false}
                        axisLine={false}
                        width={80}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="conversations"
                        name="Conversations"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                      >
                        {topAgentsData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}
