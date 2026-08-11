import { motion, type Variants } from "framer-motion";
import {
  Users,
  Building2,
  Bot,
  Activity,
  MessageSquare,
  Coins,
  DollarSign,
  FileText,
  GraduationCap,
  Key,
  Server,
  Cpu,
  Database,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn, formatNumber, formatCurrency } from "@/lib/utils";
import {
  useAdminStatsQuery,
  useAdminTelemetryQuery,
} from "@/hooks/queries/useAdminQueries";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function AdminOverviewPage() {
  const { data: stats, isLoading, isError } = useAdminStatsQuery();
  const { data: telemetry } = useAdminTelemetryQuery();

  const statCards = stats
    ? [
        { label: "Total Users", value: formatNumber(stats.totalUsers), icon: Users, color: "text-primary bg-primary/10" },
        { label: "Workspaces", value: formatNumber(stats.totalWorkspaces), icon: Building2, color: "text-violet-500 bg-violet-500/10" },
        { label: "Agents", value: formatNumber(stats.totalAgents), icon: Bot, color: "text-emerald-500 bg-emerald-500/10" },
        { label: "Active Agents", value: formatNumber(stats.activeAgents), icon: Activity, color: "text-blue-500 bg-blue-500/10" },
        { label: "Chat Messages", value: formatNumber(stats.totalChatMessages), icon: MessageSquare, color: "text-amber-500 bg-amber-500/10" },
        { label: "Tokens Used", value: formatNumber(stats.totalTokensUsed), icon: Coins, color: "text-rose-500 bg-rose-500/10" },
        { label: "Total Spend", value: formatCurrency(stats.totalCostUsd), icon: DollarSign, color: "text-orange-500 bg-orange-500/10" },
        { label: "Knowledge Files", value: formatNumber(stats.totalKnowledgeFiles), icon: FileText, color: "text-cyan-500 bg-cyan-500/10" },
        { label: "Training Jobs", value: formatNumber(stats.totalTrainingJobs), icon: GraduationCap, color: "text-fuchsia-500 bg-fuchsia-500/10" },
        { label: "API Keys", value: formatNumber(stats.totalApiKeys), icon: Key, color: "text-teal-500 bg-teal-500/10" },
      ]
    : [];

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="mb-6">
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-sm text-muted-foreground">
          High-level metrics across the entire Agent Builder platform.
        </p>
      </motion.div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && !stats && (
        <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">Unable to load platform statistics.</p>
        </div>
      )}

      {stats && (
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center mb-3", stat.color)}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="h-4 w-4" />
                System Health
              </CardTitle>
              <CardDescription>
                Runtime environment and resource usage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "gap-1.5",
                    stats?.system.databaseConnected
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      stats?.system.databaseConnected ? "bg-success" : "bg-destructive"
                    )}
                  />
                  {stats?.system.databaseConnected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Cpu className="h-4 w-4" /> Node.js
                </span>
                <span className="text-sm font-medium font-mono">
                  {telemetry?.nodeVersion ?? stats?.system.nodeVersion}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Database className="h-4 w-4" /> Platform
                </span>
                <span className="text-sm font-medium">
                  {telemetry?.platform ?? stats?.system.platform}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Uptime
                </span>
                <span className="text-sm font-medium">
                  {formatUptime(telemetry?.uptimeSeconds ?? stats?.system.uptimeSeconds ?? 0)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Memory
                </span>
                <span className="text-sm font-medium">
                  {(telemetry?.processMemoryMb ?? stats?.system.memoryMb ?? 0).toLocaleString()} MB
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Real-time Telemetry
              </CardTitle>
              <CardDescription>
                Live process metrics refreshed every 30 seconds.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Uptime</span>
                <span className="text-sm font-medium">
                  {formatUptime(telemetry?.uptimeSeconds ?? 0)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Process Memory</span>
                <span className="text-sm font-medium">
                  {(telemetry?.processMemoryMb ?? 0).toLocaleString()} MB
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Node Version</span>
                <span className="text-sm font-medium font-mono">
                  {telemetry?.nodeVersion}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Platform</span>
                <span className="text-sm font-medium">{telemetry?.platform}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm font-medium">
                  {telemetry
                    ? new Date(telemetry.timestamp).toLocaleTimeString()
                    : "-"}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
