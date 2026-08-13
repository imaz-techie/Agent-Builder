import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Bot, Users, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAdminWorkspacesQuery } from "@/hooks/queries/useAdminQueries";

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

export default function AdminWorkspacesPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useAdminWorkspacesQuery({
    search: search || undefined,
    limit: 100,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Workspaces</h1>
        <p className="text-sm text-muted-foreground">
          All workspaces hosted on the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Workspaces</CardTitle>
          <CardDescription>
            {data?.meta ? `${data.meta.totalItems} total workspaces` : "Platform workspaces"}
          </CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {isError && !data && (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">Unable to load workspaces.</p>
            </div>
          )}

          {data && data.workspaces.length === 0 && (
            <p className="text-sm text-muted-foreground py-12 text-center">
              No workspaces found.
            </p>
          )}

          {data && data.workspaces.length > 0 && (
            <div className="space-y-2">
              {data.workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-linear-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {workspace.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {workspace.name}
                      </p>
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {workspace.slug}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created {formatDate(workspace.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {workspace._count.members}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Bot className="h-4 w-4" />
                      {workspace._count.agents}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
