import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Clock,
  TrendingUp,
  Upload,
  AlertTriangle,
  Info,
  Filter,
  Plus,
  Database,
  FileText,
  Zap,
  ChevronRight,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

const trainingJobs = [
  {
    id: "tj_1",
    name: "Customer Support Agent",
    status: "completed" as const,
    progress: 100,
    chunks: 2450,
    accuracy: 94.2,
    duration: "12m 34s",
    model: "GPT-4o",
    startedAt: "2026-07-23T08:00:00Z",
    completedAt: "2026-07-23T08:12:34Z",
  },
  {
    id: "tj_2",
    name: "Product Knowledge Base",
    status: "training" as const,
    progress: 67,
    chunks: 3120,
    accuracy: null as number | null,
    duration: null,
    eta: "5m 20s",
    model: "GPT-4o",
    startedAt: "2026-07-23T14:10:00Z",
    completedAt: null,
  },
  {
    id: "tj_3",
    name: "FAQ Bot",
    status: "queued" as const,
    progress: 0,
    chunks: 890,
    accuracy: null as number | null,
    duration: null,
    model: "GPT-4o Mini",
    startedAt: null,
    completedAt: null,
  },
];

const jobStatusConfig = {
  completed: { badge: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20", label: "Completed", icon: CheckCircle2 },
  training: { badge: "text-blue-600 bg-blue-500/10 border-blue-500/20", label: "Training", icon: Loader2 },
  queued: { badge: "text-muted-foreground bg-muted border-border", label: "Queued", icon: Clock },
  failed: { badge: "text-red-600 bg-red-500/10 border-red-500/20", label: "Failed", icon: XCircle },
};

const logEntries = [
  { time: "14:10:00", level: "info" as const, message: "Training job 'Product Knowledge Base' started" },
  { time: "14:10:01", level: "info" as const, message: "Loading dataset: 3,120 chunks from 12 files" },
  { time: "14:10:03", level: "success" as const, message: "Dataset validated successfully. Token count: 1,245,000" },
  { time: "14:10:05", level: "info" as const, message: "Initializing fine-tuning pipeline with GPT-4o base model" },
  { time: "14:10:12", level: "warning" as const, message: "Chunk kf_007 failed validation — skipping 23 malformed entries" },
  { time: "14:11:30", level: "info" as const, message: "Epoch 1/50 complete — loss: 0.412, accuracy: 67.3%" },
  { time: "14:12:45", level: "info" as const, message: "Epoch 2/50 complete — loss: 0.301, accuracy: 74.1%" },
  { time: "14:14:00", level: "info" as const, message: "Epoch 3/50 complete — loss: 0.218, accuracy: 81.6%" },
  { time: "14:15:20", level: "success" as const, message: "Checkpoint saved: model_checkpoint_ep3.pt (124 MB)" },
  { time: "14:16:00", level: "info" as const, message: "Epoch 4/50 complete — loss: 0.156, accuracy: 86.9%" },
  { time: "14:17:10", level: "warning" as const, message: "Learning rate reduced to 0.0001 (plateau detected)" },
  { time: "14:18:00", level: "error" as const, message: "Temporary API rate limit hit — retrying in 30s..." },
];

const recentUploads = [
  { name: "ProductFAQ_v3.pdf", size: "4.2 MB", uploadedAt: "2 hours ago" },
  { name: "Feature_Updates.docx", size: "1.8 MB", uploadedAt: "5 hours ago" },
  { name: "CustomerFeedback_Q2.csv", size: "12.3 MB", uploadedAt: "Yesterday" },
];

const levelConfig = {
  info: { color: "text-blue-400", icon: Info, bg: "bg-blue-500/10" },
  success: { color: "text-emerald-400", icon: CheckCircle2, bg: "bg-emerald-500/10" },
  warning: { color: "text-amber-400", icon: AlertTriangle, bg: "bg-amber-500/10" },
  error: { color: "text-red-400", icon: XCircle, bg: "bg-red-500/10" },
};

export default function TrainingCenterPage() {
  const [logFilter, setLogFilter] = useState<string>("all");
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    console.log("Training upload:", acceptedFiles);
    setIsDragActive(false);
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

  const filteredLogs = logEntries.filter((l) => logFilter === "all" || l.level === logFilter);

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
          <Button variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Retrain All
          </Button>
          <Button className="gap-2 shadow-sm">
            <Play className="h-4 w-4" />
            Start New Training
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Active Jobs", value: trainingJobs.filter((j) => j.status === "training").length, icon: Loader2, color: "text-blue-500 bg-blue-500/10" },
          { label: "Completed", value: trainingJobs.filter((j) => j.status === "completed").length, icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
          { label: "Avg Accuracy", value: "94.2%", icon: TrendingUp, color: "text-purple-500 bg-purple-500/10" },
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
          {trainingJobs.map((job, i) => {
            const config = jobStatusConfig[job.status];
            const StatusIcon = config.icon;
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
                          job.status === "completed" ? "bg-emerald-500" : job.status === "training" ? "bg-blue-500" : "bg-muted"
                        )}>
                          {job.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{job.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Model: {job.model}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-[10px] gap-1.5 border", config.badge)}>
                          <StatusIcon className={cn("h-3 w-3", job.status === "training" && "animate-spin")} />
                          {config.label}
                        </Badge>
                        {job.status === "training" && (
                          <Button variant="outline" size="sm" className="gap-1.5 h-7">
                            <Pause className="h-3 w-3" /> Pause
                          </Button>
                        )}
                        {job.status === "completed" && (
                          <Button variant="outline" size="sm" className="gap-1.5 h-7">
                            <RotateCcw className="h-3 w-3" /> Retrain
                          </Button>
                        )}
                        {job.status === "queued" && (
                          <Button size="sm" className="gap-1.5 h-7">
                            <Play className="h-3 w-3" /> Start
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Database className="h-3.5 w-3.5" />
                            {job.chunks.toLocaleString()} chunks
                          </span>
                          {job.accuracy !== null && (
                            <span className="flex items-center gap-1.5">
                              <Zap className="h-3.5 w-3.5 text-amber-500" />
                              Accuracy: {job.accuracy}%
                            </span>
                          )}
                          {job.duration && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              Duration: {job.duration}
                            </span>
                          )}
                          {job.eta && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-blue-500" />
                              ETA: {job.eta}
                            </span>
                          )}
                        </div>
                      </div>

                      {job.status === "training" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium tabular-nums">{job.progress}%</span>
                          </div>
                          <div className="relative">
                            <Progress value={job.progress} className="h-2" />
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              animate={{ x: ["-100%", "200%"] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                          </div>
                        </div>
                      )}

                      {job.status === "completed" && (
                        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Training completed successfully
                        </div>
                      )}

                      {job.status === "queued" && (
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
          })}
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
            <h3 className="text-sm font-semibold">Recent Uploads</h3>
            {recentUploads.map((upload, i) => (
              <motion.div
                key={upload.name}
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
                        <p className="text-sm font-medium">{upload.name}</p>
                        <p className="text-xs text-muted-foreground">{upload.uploadedAt}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{upload.size}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
                  <AnimatePresence>
                    {filteredLogs.map((log, i) => {
                      const config = levelConfig[log.level];
                      const LogIcon = config.icon;
                      return (
                        <motion.div
                          key={`${log.time}-${i}`}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.02 }}
                          className="flex items-start gap-3 py-1 hover:bg-white/5 rounded px-2 -mx-2 transition-colors"
                        >
                          <span className="text-zinc-500 shrink-0 tabular-nums">{log.time}</span>
                          <LogIcon className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", config.color)} />
                          <span className="text-zinc-300 dark:text-zinc-400 leading-relaxed">{log.message}</span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
