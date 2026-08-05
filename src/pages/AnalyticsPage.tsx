import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Clock,
  Coins,
  MessageSquare,
  Smile,
  TrendingUp,
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
import { dashboardStats, monthlyUsage } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";

const dailyData = Array.from({ length: 30 }, (_, i) => ({
  day: `Jul ${i + 1}`,
  conversations: Math.floor(350 + Math.sin(i * 0.5) * 120 + Math.random() * 80),
  tokens: Math.floor(85000 + Math.sin(i * 0.3) * 30000 + Math.random() * 15000),
}));

const tokenLineData = monthlyUsage.map((m) => ({
  month: m.month,
  inputTokens: Math.floor(m.tokens * 0.6),
  outputTokens: Math.floor(m.tokens * 0.4),
}));

const satisfactionData = [
  { month: "Jan", score: 4.5 },
  { month: "Feb", score: 4.6 },
  { month: "Mar", score: 4.5 },
  { month: "Apr", score: 4.7 },
  { month: "May", score: 4.6 },
  { month: "Jun", score: 4.8 },
  { month: "Jul", score: 4.8 },
];

const topAgentsData = [
  { name: "CodeAssist", conversations: 22187, color: "#22c55e" },
  { name: "SupportBot Pro", conversations: 15768, color: "#6366f1" },
  { name: "Sales Navigator", conversations: 8934, color: "#a855f7" },
  { name: "Data Analyst", conversations: 7892, color: "#06b6d4" },
  { name: "Content Creator", conversations: 5671, color: "#f59e0b" },
  { name: "HR Assistant", conversations: 3456, color: "#ec4899" },
];

const heatmapData = (() => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return days.map((day) =>
    hours.map((hour) => {
      const isWorkHour = hour >= 9 && hour <= 17;
      const isWeekday = days.indexOf(day) < 5;
      const base = isWeekday ? (isWorkHour ? 70 : 25) : 10;
      return {
        day,
        hour,
        value: Math.floor(base + Math.random() * 30),
      };
    }),
  );
})();

const topQuestions = [
  { question: "How do I reset my password?", count: 1247 },
  { question: "What are your pricing plans?", count: 983 },
  { question: "How do I integrate the API?", count: 876 },
  { question: "Can I export my data?", count: 754 },
  { question: "Do you offer a free trial?", count: 698 },
  { question: "How do I create a new agent?", count: 621 },
  { question: "What models do you support?", count: 543 },
  { question: "Is there a usage limit?", count: 467 },
  { question: "How do I cancel my subscription?", count: 389 },
  { question: "Do you have an iOS app?", count: 312 },
];

const statCards = [
  {
    label: "Total Conversations",
    value: formatNumber(dashboardStats.totalConversations),
    change: "+8.3%",
    up: true,
    icon: MessageSquare,
    color: "text-primary",
  },
  {
    label: "Avg Response Time",
    value: `${dashboardStats.avgResponseTime}s`,
    change: "-0.2s",
    up: false,
    icon: Clock,
    color: "text-info",
  },
  {
    label: "Token Usage",
    value: formatNumber(dashboardStats.totalTokens),
    change: "+15%",
    up: true,
    icon: Coins,
    color: "text-secondary",
  },
  {
    label: "User Satisfaction",
    value: `${dashboardStats.satisfactionScore}/5`,
    change: "+0.1",
    up: true,
    icon: Smile,
    color: "text-success",
  },
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

import {
  dashboardStats as mockDashboardStats,
  monthlyUsage as mockMonthlyUsage,
} from "@/lib/mock-data";
import {
  useDashboardStatsQuery,
  useMonthlyUsageQuery,
} from "@/hooks/queries/useAnalyticsQueries";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d");
  const { data: stats = mockDashboardStats } = useDashboardStatsQuery();
  const { data: usage = mockMonthlyUsage } = useMonthlyUsageQuery();

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
                    interval={4}
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
              <CardTitle className="text-base">Monthly Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyUsage}>
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
                    dataKey="month"
                    tick={{
                      fontSize: 10,
                      fill: "var(--color-muted-foreground)",
                    }}
                    tickLine={false}
                    axisLine={false}
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
                    dataKey="conversations"
                    name="Conversations"
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
              <CardTitle className="text-base">User Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={satisfactionData}>
                  <defs>
                    <linearGradient
                      id="colorSatisfaction"
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
                    dataKey="month"
                    tick={{
                      fontSize: 10,
                      fill: "var(--color-muted-foreground)",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[4, 5]}
                    tick={{
                      fontSize: 10,
                      fill: "var(--color-muted-foreground)",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Score"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#colorSatisfaction)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Peak Usage Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  <div className="flex gap-[2px] mb-1 pl-10">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div
                        key={i}
                        className="flex-1 text-center text-[8px] text-muted-foreground"
                      >
                        {i % 3 === 0 ? `${i}:00` : ""}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-[2px]">
                    {heatmapData.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex items-center gap-[2px]">
                        <span className="w-10 text-[10px] text-muted-foreground text-right pr-1 shrink-0">
                          {row[0].day}
                        </span>
                        {row.map((cell, colIdx) => (
                          <motion.div
                            key={colIdx}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              duration: 0.3,
                              delay: (rowIdx * 24 + colIdx) * 0.002,
                            }}
                            className="flex-1 aspect-square rounded-[2px] cursor-pointer hover:ring-1 hover:ring-primary/50 transition-all"
                            style={{
                              backgroundColor:
                                cell.value > 80
                                  ? "var(--color-primary)"
                                  : cell.value > 60
                                    ? "var(--color-primary)"
                                    : cell.value > 40
                                      ? "var(--color-info)"
                                      : cell.value > 20
                                        ? "var(--color-info)"
                                        : "var(--color-muted)",
                              opacity:
                                cell.value > 80
                                  ? 1
                                  : cell.value > 60
                                    ? 0.7
                                    : cell.value > 40
                                      ? 0.5
                                      : cell.value > 20
                                        ? 0.3
                                        : 0.2,
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-3">
                    <span className="text-[10px] text-muted-foreground">
                      Less
                    </span>
                    {[0.2, 0.35, 0.5, 0.7, 1].map((op, i) => (
                      <div
                        key={i}
                        className="h-3 w-3 rounded-[2px]"
                        style={{
                          background: "var(--color-primary)",
                          opacity: op,
                        }}
                      />
                    ))}
                    <span className="text-[10px] text-muted-foreground">
                      More
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Most Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topQuestions.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xs text-muted-foreground w-5 text-right shrink-0 font-mono">
                    {i + 1}
                  </span>
                  <p className="text-sm flex-1 min-w-0 truncate">
                    {item.question}
                  </p>
                  <div className="w-40 shrink-0">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(item.count / topQuestions[0].count) * 100}%`,
                        }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground w-12 text-right shrink-0">
                    {formatNumber(item.count)}
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
