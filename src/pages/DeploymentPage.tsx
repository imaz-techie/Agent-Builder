import { useState } from "react";
import { motion } from "framer-motion";
import {
  Rocket,
  RotateCcw,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Terminal,
  Info,
  AlertOctagon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/utils";

const pipelineStages = [
  { key: "development", label: "Development", icon: CheckCircle2 },
  { key: "testing", label: "Testing", icon: Clock },
  { key: "staging", label: "Staging", icon: Clock },
  { key: "production", label: "Production", icon: Clock },
];

const activeStageIndex = 0;

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  active: { label: "Deployed", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  pending: { label: "Pending", icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  failed: { label: "Failed", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  rolled_back: { label: "Rolled Back", icon: AlertTriangle, color: "text-muted-foreground", bg: "bg-muted" },
};

const envConfig: Record<string, { label: string; className: string }> = {
  production: { label: "Production", className: "bg-success/10 text-success border-success/20" },
  staging: { label: "Staging", className: "bg-warning/10 text-warning border-warning/20" },
  development: { label: "Development", className: "bg-info/10 text-info border-info/20" },
};

const deploymentHistory = [
  { id: "dep_001", version: "3.2.1", environment: "production", status: "active", deployedBy: "Sarah Chen", date: "2026-07-20T14:30:00Z", agent: "SupportBot Pro" },
  { id: "dep_002", version: "2.1.0", environment: "production", status: "active", deployedBy: "Marcus Johnson", date: "2026-07-18T10:00:00Z", agent: "Sales Navigator" },
  { id: "dep_003", version: "3.3.0-beta", environment: "staging", status: "pending", deployedBy: "Sarah Chen", date: "2026-07-22T16:00:00Z", agent: "SupportBot Pro" },
  { id: "dep_004", version: "1.8.3", environment: "production", status: "active", deployedBy: "Alex Rivera", date: "2026-07-22T08:15:00Z", agent: "CodeAssist" },
  { id: "dep_005", version: "1.6.0-dev", environment: "development", status: "failed", deployedBy: "Diana Kim", date: "2026-07-21T11:30:00Z", agent: "HR Assistant" },
];

interface LogEntry {
  timestamp: string;
  level: "success" | "warning" | "error" | "info";
  message: string;
}

const deploymentLogs: LogEntry[] = [
  { timestamp: "14:30:02", level: "info", message: "Starting deployment of SupportBot Pro v3.2.1 to production..." },
  { timestamp: "14:30:05", level: "info", message: "Running pre-deployment health checks..." },
  { timestamp: "14:30:08", level: "success", message: "Health checks passed. All 12 endpoints responding." },
  { timestamp: "14:30:12", level: "info", message: "Building production bundle... (42.3 MB)" },
  { timestamp: "14:30:35", level: "success", message: "Build completed successfully in 23s." },
  { timestamp: "14:30:38", level: "warning", message: "Token usage at 87% of monthly quota. Consider upgrading." },
  { timestamp: "14:30:42", level: "success", message: "Deployed to 4 regions. CDN propagation in progress." },
  { timestamp: "14:31:05", level: "success", message: "Deployment verified. SupportBot Pro v3.2.1 is live in production." },
];

const logLevelConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  success: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  error: { icon: AlertOctagon, color: "text-destructive", bg: "bg-destructive/10" },
  info: { icon: Info, color: "text-info", bg: "bg-info/10" },
};

export default function DeploymentPage() {
  const [selectedLog, setSelectedLog] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Deployment</h1>
          <p className="text-sm text-muted-foreground">Manage deployments across environments.</p>
        </div>
        <Button className="gap-2 bg-gradient-primary text-white hover:opacity-90">
          <Rocket className="h-4 w-4" />
          Deploy New Version
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between px-2">
            {pipelineStages.map((stage, i) => {
              const StageIcon = stage.icon;
              const isActive = i === activeStageIndex;
              const isCompleted = i < activeStageIndex;
              return (
                <div key={stage.key} className="flex items-center flex-1 last:flex-none">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-success text-white shadow-lg shadow-success/30 ring-4 ring-success/10"
                          : isCompleted
                            ? "bg-success/15 text-success"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <StageIcon className="h-5 w-5" />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isActive ? "text-success" : isCompleted ? "text-success/70" : "text-muted-foreground"
                      }`}
                    >
                      {stage.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activePipelineIndicator"
                        className="h-1 w-8 rounded-full bg-success"
                      />
                    )}
                  </motion.div>
                  {i < pipelineStages.length - 1 && (
                    <div className="flex-1 mx-2 mb-6">
                      <div className="h-[2px] w-full rounded-full overflow-hidden bg-muted">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: i < activeStageIndex ? "100%" : "0%" }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
                          className="h-full bg-gradient-to-r from-success to-success/40"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deployment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-3 font-medium text-muted-foreground">Version</th>
                      <th className="text-left py-3 px-3 font-medium text-muted-foreground">Environment</th>
                      <th className="text-left py-3 px-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-3 font-medium text-muted-foreground">Deployed By</th>
                      <th className="text-left py-3 px-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-3 px-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deploymentHistory.map((dep, i) => {
                      const status = statusConfig[dep.status];
                      const env = envConfig[dep.environment];
                      const StatusIcon = status.icon;
                      return (
                        <motion.tr
                          key={dep.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                          className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-3">
                            <div>
                              <span className="font-mono text-xs font-medium">v{dep.version}</span>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{dep.agent}</p>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant="outline" className={`text-[10px] ${env.className}`}>{env.label}</Badge>
                          </td>
                          <td className="py-3 px-3">
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${status.bg} ${status.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-muted-foreground text-xs">{dep.deployedBy}</td>
                          <td className="py-3 px-3 text-muted-foreground text-xs">{formatDate(dep.date)}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => setSelectedLog(i)}>
                                <FileText className="h-3 w-3" />
                                View Logs
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive">
                                <RotateCcw className="h-3 w-3" />
                                Rollback
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center gap-2">
              <Terminal className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Deployment Logs</CardTitle>
              <Badge variant="outline" className="ml-auto text-[10px]">{deploymentHistory[selectedLog]?.agent}</Badge>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-1 font-mono text-xs">
                  {deploymentLogs.map((log, i) => {
                    const levelCfg = logLevelConfig[log.level];
                    const LevelIcon = levelCfg.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.04 }}
                        className="flex items-start gap-2 py-1.5 hover:bg-muted/50 rounded px-2 -mx-2"
                      >
                        <span className="text-muted-foreground shrink-0">{log.timestamp}</span>
                        <div className={`shrink-0 mt-0.5`}>
                          <LevelIcon className={`h-3 w-3 ${levelCfg.color}`} />
                        </div>
                        <span className="text-foreground">{log.message}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
