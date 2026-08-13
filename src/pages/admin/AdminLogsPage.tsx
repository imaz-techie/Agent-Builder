import { useState } from "react";
import { motion } from "framer-motion";
import { ScrollText, Loader2, AlertCircle, Info, AlertTriangle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAdminLogsQuery } from "@/hooks/queries/useAdminQueries";

const LOG_LEVELS = ["ERROR", "WARN", "INFO", "DEBUG"] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

const LEVEL_STYLES: Record<LogLevel, string> = {
  ERROR: "bg-destructive/10 text-destructive",
  WARN: "bg-amber-500/10 text-amber-500",
  INFO: "bg-primary/10 text-primary",
  DEBUG: "bg-muted text-muted-foreground",
};

const LEVEL_ICONS = {
  ERROR: XCircle,
  WARN: AlertTriangle,
  INFO: Info,
  DEBUG: Info,
} as const;

function formatTimestamp(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
}

export default function AdminLogsPage() {
  const [level, setLevel] = useState<string>("all");

  const { data: logs, isLoading, isError } = useAdminLogsQuery({
    limit: 200,
    level: level === "all" ? undefined : level,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold">System Logs</h1>
        <p className="text-sm text-muted-foreground">
          Platform-level system events and error logs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ScrollText className="h-4 w-4" />
            Recent Logs
          </CardTitle>
          <CardDescription>Filter by severity level.</CardDescription>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant={level === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setLevel("all")}
            >
              All
            </Button>
            {LOG_LEVELS.map((lvl) => (
              <Button
                key={lvl}
                variant={level === lvl ? "default" : "outline"}
                size="sm"
                onClick={() => setLevel(lvl)}
              >
                {lvl}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {isError && !logs && (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">Unable to load system logs.</p>
            </div>
          )}

          {logs && logs.length === 0 && (
            <p className="text-sm text-muted-foreground py-12 text-center">
              No logs found for the selected level.
            </p>
          )}

          {logs && logs.length > 0 && (
            <div className="space-y-2">
              {logs.map((log) => {
                const lvl = LOG_LEVELS.includes(log.level as LogLevel)
                  ? (log.level as LogLevel)
                  : "INFO";
                const Icon = LEVEL_ICONS[lvl];
                return (
                  <div
                    key={log.id}
                    className="rounded-lg border border-border p-3 flex items-start gap-3 hover:bg-muted/40 transition-colors"
                  >
                    <div
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                        LEVEL_STYLES[lvl]
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className={cn("text-[10px]", LEVEL_STYLES[lvl])}>
                          {log.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm mt-1 break-words">{log.message}</p>
                      {log.metadata && (
                        <pre className="mt-2 text-[11px] font-mono text-muted-foreground bg-muted/50 rounded-md p-2 overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
