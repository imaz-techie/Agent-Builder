import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Clock,
  TrendingUp,
  Upload,
  AlertTriangle,
  Info,
  Plus,
  Database,
  FileText,
  XCircle,
  Cpu,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import {
  useTrainingDatasetsQuery,
  useTrainingJobsQuery,
  useTrainingJobLogsQuery,
} from "@/hooks/queries/useTrainingQueries";
import {
  useCreateTrainingDatasetMutation,
  useStartTrainingJobMutation,
  useCancelTrainingJobMutation,
  useRetryTrainingJobMutation,
} from "@/hooks/mutations/useTrainingMutations";
import { useAgentsQuery } from "@/hooks/queries/useAgentQueries";
import type { TrainingJob, TrainingStatus } from "@/types/training.types";
import { formatFileSize } from "@/types/training.types";

const jobStatusConfig: Record<
  TrainingStatus,
  { badge: string; label: string; icon: typeof CheckCircle2 }
> = {
  COMPLETED: { badge: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20", label: "Completed", icon: CheckCircle2 },
  IN_PROGRESS: { badge: "text-blue-600 bg-blue-500/10 border-blue-500/20", label: "Training", icon: Loader2 },
  QUEUED: { badge: "text-muted-foreground bg-muted border-border", label: "Queued", icon: Clock },
  FAILED: { badge: "text-red-600 bg-red-500/10 border-red-500/20", label: "Failed", icon: XCircle },
  CANCELLED: { badge: "text-amber-600 bg-amber-500/10 border-amber-500/20", label: "Cancelled", icon: XCircle },
};

const ACTIVE_STATUSES: TrainingStatus[] = ["QUEUED", "IN_PROGRESS"];

function parseLogLine(line: string): { time: string; message: string } {
  const match = line.match(/^\[([^\]]+)\]\s*(.*)$/);
  if (match) return { time: match[1], message: match[2] };
  return { time: "", message: line };
}

function LogLevelIcon({ message }: { message: string }) {
  const lower = message.toLowerCase();
  if (lower.includes("success") || lower.includes("complete")) {
    return <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-400" />;
  }
  if (lower.includes("fail") || lower.includes("error") || lower.includes("skipping")) {
    return <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-400" />;
  }
  return <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-400" />;
}

export default function TrainingCenterPage() {
  const [logFilter, setLogFilter] = useState<string>("all");
  const [isDragActive, setIsDragActive] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [jobName, setJobName] = useState("Fine-tune run");
  const [agentId, setAgentId] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const [epochs, setEpochs] = useState(3);
  const [learningRate, setLearningRate] = useState(0.0001);
  const [batchSize, setBatchSize] = useState(8);

  const { data: jobsData, isLoading: jobsLoading } = useTrainingJobsQuery();
  const jobs = jobsData?.jobs ?? [];
  const { data: datasets = [] } = useTrainingDatasetsQuery();
  const { data: agents = [] } = useAgentsQuery();
  const activeJobId = selectedJobId ?? jobs[0]?.id ?? null;
  const { data: logs = [], isLoading: logsLoading } = useTrainingJobLogsQuery(activeJobId);

  const createDataset = useCreateTrainingDatasetMutation();
  const startJob = useStartTrainingJobMutation();
  const cancelJob = useCancelTrainingJobMutation();
  const retryJob = useRetryTrainingJobMutation();

  const onDrop = (acceptedFiles: File[]) => {
    setIsDragActive(false);
    acceptedFiles.forEach((file) => {
      const name = file.name.replace(/\.[^.]+$/, "") || file.name;
      createDataset.mutate({
        name,
        version: "v1.0",
        sampleCount: Math.max(1, Math.round(file.size / 400)),
      });
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      "application/pdf": [".pdf"],
      "text/csv": [".csv"],
      "application/json": [".json"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    maxSize: 100 * 1024 * 1024,
  });

  const parsedLogs = logs.map(parseLogLine);

  const activeCount = jobs.filter((j) => j.status === "IN_PROGRESS").length;
  const queuedCount = jobs.filter((j) => j.status === "QUEUED").length;
  const completedCount = jobs.filter((j) => j.status === "COMPLETED").length;

  const handleStart = () => {
    if (!agentId) return;
    startJob.mutate(
      {
        jobName,
        agentId,
        datasetId: datasetId || undefined,
        epochs,
        learningRate,
        batchSize,
      },
      { onSuccess: () => setShowStartDialog(false) }
    );
  };

  const agentNameFor = (job: TrainingJob) =>
    agents.find((a) => a.id === job.agentId)?.name ?? "Unknown Agent";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Training Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and manage agent training jobs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="gap-2 shadow-sm"
            onClick={() => setShowStartDialog(true)}
          >
            <Play className="h-4 w-4" />
            Start New Training
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Active Jobs", value: activeCount, icon: Loader2, color: "text-blue-500 bg-blue-500/10" },
          { label: "Queued", value: queuedCount, icon: Clock, color: "text-amber-500 bg-amber-500/10" },
          { label: "Completed", value: completedCount, icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="jobs" className="gap-1.5">
            <Database className="h-3.5 w-3.5" /> Training Jobs
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-1.5">
            <Upload className="h-3.5 w-3.5" /> Upload Data
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Training Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          {jobsLoading ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading training jobs...
            </div>
          ) : jobs.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center space-y-3">
                <Database className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  No training jobs yet. Start a new training run to fine-tune your agents.
                </p>
                <Button className="gap-2" onClick={() => setShowStartDialog(true)}>
                  <Plus className="h-4 w-4" />
                  Start New Training
                </Button>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job, i) => {
              const config = jobStatusConfig[job.status];
              const StatusIcon = config.icon;
              const dataset = datasets.find((d) => d.id === job.datasetId);
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                >
                  <Card className="hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-11 w-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0",
                            job.status === "COMPLETED" ? "bg-emerald-500" : ACTIVE_STATUSES.includes(job.status) ? "bg-blue-500" : "bg-muted"
                          )}>
                            {job.jobName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{job.jobName}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Agent: {agentNameFor(job)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn("text-[10px] gap-1.5 border", config.badge)}>
                            <StatusIcon className={cn("h-3 w-3", job.status === "IN_PROGRESS" && "animate-spin")} />
                            {config.label}
                          </Badge>
                          {ACTIVE_STATUSES.includes(job.status) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 h-7"
                              onClick={() => cancelJob.mutate(job.id)}
                              disabled={cancelJob.isPending}
                            >
                              <XCircle className="h-3 w-3" /> Cancel
                            </Button>
                          )}
                          {(job.status === "FAILED" || job.status === "CANCELLED" || job.status === "COMPLETED") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 h-7"
                              onClick={() => retryJob.mutate(job.id)}
                              disabled={retryJob.isPending}
                            >
                              <RotateCcw className="h-3 w-3" /> Retrain
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1.5">
                              <Database className="h-3.5 w-3.5" />
                              {dataset ? dataset.name : "No dataset"}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Cpu className="h-3.5 w-3.5" />
                              Epoch {job.currentEpoch}/{job.totalEpochs}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                              Loss: {job.currentLoss}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              LR: {job.learningRate}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground/70">
                            Started {formatRelativeTime(job.createdAt)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium tabular-nums">
                              {job.progressPercent.toFixed(0)}%
                            </span>
                          </div>
                          <div className="relative">
                            <Progress value={job.progressPercent} className="h-2" />
                            {ACTIVE_STATUSES.includes(job.status) && (
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              />
                            )}
                          </div>
                        </div>

                        {job.errorMessage && (
                          <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {job.errorMessage}
                          </div>
                        )}
                        {job.status === "COMPLETED" && (
                          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Training completed successfully
                          </div>
                        )}
                        {job.status === "QUEUED" && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            Waiting for available resources
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200",
                  isDragActive
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-muted-foreground/25 hover:border-muted-foreground/40 hover:bg-muted/30"
                )}
              >
                <input {...getInputProps()} />
                <motion.div
                  animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className={cn(
                    "h-16 w-16 rounded-2xl flex items-center justify-center transition-colors",
                    isDragActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    <Upload className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {isDragActive ? "Drop files to upload" : "Drop training data here or click to browse"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 max-w-md mx-auto">
                      Upload CSV, JSON, TXT, or PDF files containing training examples.
                      Files will be automatically chunked and indexed.
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" className="mt-1">
                    Browse Files
                  </Button>
                </motion.div>
              </div>

              <div className="mt-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Supported Formats</h3>
                <div className="flex flex-wrap gap-2">
                  {["PDF", "CSV", "JSON", "TXT", "Markdown"].map((fmt) => (
                    <Badge key={fmt} variant="secondary" className="text-xs font-mono">
                      {fmt}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Registered Datasets</h3>
            {datasets.length === 0 ? (
              <p className="text-xs text-muted-foreground/70 py-4 text-center">
                No datasets registered yet. Drop a file above to create one.
              </p>
            ) : (
              datasets.map((dataset, i) => (
                <motion.div
                  key={dataset.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                >
                  <Card className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{dataset.name}</p>
                          <p className="text-xs text-muted-foreground">
                            v{dataset.version} · {dataset.sampleCount.toLocaleString()} samples ·{" "}
                            {formatRelativeTime(dataset.createdAt)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(dataset.fileSizeBytes)}
                      </span>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Training Logs</h3>
            <div className="flex items-center gap-1.5">
              {["all", "info", "success", "warning", "error"].map((level) => (
                <Button
                  key={level}
                  variant={logFilter === level ? "default" : "ghost"}
                  size="sm"
                  className="h-7 text-xs capitalize"
                  onClick={() => setLogFilter(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          <div className="w-full sm:w-72">
            <Label className="text-xs text-muted-foreground">Job</Label>
            <Select
              value={activeJobId ?? ""}
              onValueChange={(value) => setSelectedJobId(value)}
            >
              <SelectTrigger className="h-9 mt-1.5">
                <SelectValue placeholder="Select a job" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.jobName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card className="overflow-hidden">
            <div className="bg-zinc-950 dark:bg-zinc-900 rounded-xl p-1">
              <div className="bg-zinc-900 dark:bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono ml-2">training-output.log</span>
                </div>

                <div className="max-h-[420px] overflow-y-auto p-4 space-y-1 font-mono text-xs">
                  {logsLoading ? (
                    <div className="flex items-center justify-center py-8 text-zinc-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                      Loading logs...
                    </div>
                  ) : parsedLogs.length === 0 ? (
                    <p className="text-zinc-500 py-8 text-center">No logs available for this job.</p>
                  ) : (
                    <AnimatePresence>
                      {parsedLogs.map((log, i) => (
                        <motion.div
                          key={`${log.time}-${i}`}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, delay: Math.min(i, 20) * 0.01 }}
                          className="flex items-start gap-3 py-1 hover:bg-white/5 rounded px-2 -mx-2 transition-colors"
                        >
                          <span className="text-zinc-500 shrink-0 tabular-nums">{log.time}</span>
                          <LogLevelIcon message={log.message} />
                          <span className="text-zinc-300 dark:text-zinc-400 leading-relaxed break-words">
                            {log.message}
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Training</DialogTitle>
            <DialogDescription>
              Configure a fine-tuning job for one of your agents.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-name" className="text-xs text-muted-foreground">
                Job Name
              </Label>
              <Input
                id="job-name"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Agent</Label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Dataset (optional)
              </Label>
              <Select value={datasetId} onValueChange={setDatasetId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="No dataset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No dataset</SelectItem>
                  {datasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      {dataset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Epochs</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={epochs}
                  onChange={(e) => setEpochs(parseInt(e.target.value, 10) || 1)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">LR</Label>
                <Input
                  type="number"
                  min={0.00001}
                  max={1}
                  step={0.0001}
                  value={learningRate}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value) || 0.0001)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Batch</Label>
                <Input
                  type="number"
                  min={1}
                  max={512}
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value, 10) || 1)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStartDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="gap-2"
              onClick={handleStart}
              disabled={!agentId || !jobName.trim() || startJob.isPending}
            >
              {startJob.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {startJob.isPending ? "Queuing..." : "Start Training"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Separator className="my-4" />
    </div>
  );
}
