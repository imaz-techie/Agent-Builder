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
  Loader2,
  Globe,
  Hash,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { useDeploymentsQuery } from "@/hooks/queries/useDeploymentQueries";
import {
  useCreateDeploymentMutation,
  useRollbackDeploymentMutation,
} from "@/hooks/mutations/useDeploymentMutations";
import { useAgentsQuery } from "@/hooks/queries/useAgentQueries";
import type { DeploymentEnvironment } from "@/types/deployment.types";

const pipelineStages = [
  { key: "development", label: "Development", icon: CheckCircle2 },
  { key: "staging", label: "Staging", icon: Clock },
  { key: "production", label: "Production", icon: Clock },
];

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  ACTIVE: { label: "Active", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  INACTIVE: { label: "Inactive", icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  FAILED: { label: "Failed", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  ROLLED_BACK: { label: "Rolled Back", icon: AlertTriangle, color: "text-muted-foreground", bg: "bg-muted" },
};

const envConfig: Record<string, { label: string; className: string }> = {
  PRODUCTION: { label: "Production", className: "bg-success/10 text-success border-success/20" },
  STAGING: { label: "Staging", className: "bg-warning/10 text-warning border-warning/20" },
  DEVELOPMENT: { label: "Development", className: "bg-info/10 text-info border-info/20" },
};

export default function DeploymentPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string>("");
  const [environment, setEnvironment] = useState<DeploymentEnvironment>("PRODUCTION");
  const { data: deployments = [], isLoading, isError } = useDeploymentsQuery();
  const { data: agents = [] } = useAgentsQuery();
  const createDeploymentMutation = useCreateDeploymentMutation();
  const rollbackDeploymentMutation = useRollbackDeploymentMutation();

  const selected = deployments.find((d) => d.id === selectedId) || null;

  const handleDeployNew = () => {
    if (!agentId) return;
    createDeploymentMutation.mutate(
      { agentId, environment },
      {
        onSuccess: () => {
          setAgentId("");
          setEnvironment("PRODUCTION");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Deployment</h1>
          <p className="text-sm text-muted-foreground">Manage deployments across environments.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={agentId} onValueChange={setAgentId}>
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <SelectValue placeholder="Select agent" />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={environment} onValueChange={(v) => setEnvironment(v as DeploymentEnvironment)}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRODUCTION">Production</SelectItem>
              <SelectItem value="STAGING">Staging</SelectItem>
              <SelectItem value="DEVELOPMENT">Development</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleDeployNew}
            disabled={createDeploymentMutation.isPending || !agentId}
            className="gap-2 bg-gradient-primary text-white hover:opacity-90"
          >
            {createDeploymentMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4" />
            )}
            Deploy
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between px-2">
            {pipelineStages.map((stage, i) => {
              const StageIcon = stage.icon;
              const isActive = i === pipelineStages.length - 1;
              const isCompleted = i < pipelineStages.length - 1;
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
                  </motion.div>
                  {i < pipelineStages.length - 1 && (
                    <div className="flex-1 mx-2 mb-6">
                      <div className="h-[2px] w-full rounded-full overflow-hidden bg-muted">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: isCompleted ? "100%" : "0%" }}
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
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-3" />
                  <p className="text-xs text-muted-foreground">Loading deployments...</p>
                </div>
              )}
              {isError && !isLoading && (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  Failed to load deployments. Please check your connection.
                </div>
              )}
              {!isLoading && !isError && (
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
                      {deployments.map((dep, i) => {
                        const status = statusConfig[dep.status] || statusConfig.ACTIVE;
                        const env = envConfig[dep.environment] || envConfig.DEVELOPMENT;
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
                                <span className="font-mono text-xs font-medium">v{dep.versionNumber}</span>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  {dep.agent?.name || dep.agentId.slice(0, 8)}
                                </p>
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
                            <td className="py-3 px-3 text-muted-foreground text-xs">
                              {dep.deployedById.slice(0, 8)}
                            </td>
                            <td className="py-3 px-3 text-muted-foreground text-xs">
                              {formatRelativeTime(dep.deployedAt)}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => setSelectedId(dep.id)}>
                                  <FileText className="h-3 w-3" />
                                  Details
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive"
                                  onClick={() => rollbackDeploymentMutation.mutate(dep.id)}
                                  disabled={rollbackDeploymentMutation.isPending}
                                >
                                  <RotateCcw className="h-3 w-3" />
                                  Rollback
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                      {deployments.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                            No deployments yet. Deploy an agent to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center gap-2">
              <Terminal className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Deployment Details</CardTitle>
              <Badge variant="outline" className="ml-auto text-[10px]">
                {selected ? `v${selected.versionNumber}` : "None"}
              </Badge>
            </CardHeader>
            <CardContent className="flex-1 p-4">
              {!selected ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  Select a deployment to view details.
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Info className="h-3 w-3 shrink-0" />
                    Deployment {selected.id.slice(0, 8)}
                  </div>
                  <div className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Agent</span>
                      <span className="font-medium">{selected.agent?.name || selected.agentId.slice(0, 8)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Version</span>
                      <span className="font-mono text-xs">v{selected.versionNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Environment</span>
                      <span>{envConfig[selected.environment]?.label || selected.environment}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className="capitalize">{selected.status.toLowerCase().replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Deployed At</span>
                      <span>{formatDate(selected.deployedAt)}</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <Globe className="h-3 w-3 text-muted-foreground" />
                      Endpoint
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground break-all">
                        {selected.url || selected.domain || "No endpoint configured"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
