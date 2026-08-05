import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  MessageSquare,
  Clock,
  ChevronDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Copy,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { agents as mockAgents } from "@/lib/mock-data";
import type { Agent } from "@/types/agent.types";
import { useAgentsQuery } from "@/hooks/queries/useAgentQueries";
import { useDeleteAgentMutation } from "@/hooks/mutations/useAgentMutations";
import {
  formatNumber,
  getStatusColor,
  formatRelativeTime,
  formatDate,
} from "@/lib/utils";

type SortField = "name" | "lastTraining" | "createdAt" | "totalChats";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 8;

const categoryFilters: { label: string; values: string[] }[] = [
  { label: "Support", values: ["Customer Support"] },
  { label: "Sales", values: ["Sales"] },
  { label: "Marketing", values: ["Marketing"] },
  { label: "Technical", values: ["Development", "Analytics"] },
  { label: "General", values: ["HR"] },
];

const statusFilters: { label: string; value: string }[] = [
  { label: "Active", value: "active" },
  { label: "Training", value: "training" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "inactive" },
];

const displayStatus: Record<string, string> = {
  active: "Active",
  training: "Training",
  draft: "Draft",
  inactive: "Archived",
};

const sortLabels: Record<SortField, string> = {
  name: "Name",
  lastTraining: "Last Active",
  createdAt: "Created",
  totalChats: "Total Chats",
};

function compareAgents(a: Agent, b: Agent, field: SortField, dir: SortDir): number {
  let cmp = 0;
  if (field === "name") cmp = a.name.localeCompare(b.name);
  else if (field === "lastTraining")
    cmp = new Date(a.lastTraining).getTime() - new Date(b.lastTraining).getTime();
  else if (field === "createdAt")
    cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  else if (field === "totalChats") cmp = a.totalChats - b.totalChats;
  return dir === "asc" ? cmp : -cmp;
}

export default function AgentsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  const { data: agentList = mockAgents, isLoading } = useAgentsQuery("ws_default", {
    search,
    category: categoryFilter,
    status: statusFilter,
  });
  const deleteAgentMutation = useDeleteAgentMutation();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let result = [...agentList];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.owner.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      const cat = categoryFilters.find((c) => c.label === categoryFilter);
      if (cat) {
        result = result.filter((a) => cat.values.includes(a.category));
      }
    }

    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }

    result.sort((a, b) => compareAgents(a, b, sortField, sortDir));
    return result;
  }, [search, categoryFilter, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const startIdx = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(safePage * PAGE_SIZE, filtered.length);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function toggleSelectAll() {
    if (selected.size === paged.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paged.map((a) => a.id)));
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">AI Agents</h1>
          <p className="text-sm text-muted-foreground">
            Create, manage, and monitor your AI agents across your workspace.
          </p>
        </div>
        <Link to="/agents/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Agent
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              setCategoryFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryFilters.map((c) => (
                <SelectItem key={c.label} value={c.label}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusFilters.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortField}
            onValueChange={(v) => setSortField(v as SortField)}
          >
            <SelectTrigger className="w-[150px]">
              <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 opacity-50" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(sortLabels) as SortField[]).map((f) => (
                <SelectItem key={f} value={f}>
                  {sortLabels[f]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center border border-border rounded-lg overflow-hidden ml-auto">
            <button
              onClick={() => setView("grid")}
              className={`p-2 transition-colors ${
                view === "grid"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 transition-colors ${
                view === "list"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paged.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
            >
              <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer h-full">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-11 w-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                        style={{ backgroundColor: agent.avatarColor }}
                      >
                        {agent.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {agent.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-[10px] mt-0.5"
                        >
                          {agent.category}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Eye className="h-3.5 w-3.5" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Pencil className="h-3.5 w-3.5" />
                          Edit Agent
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Copy className="h-3.5 w-3.5" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {agent.description}
                  </p>

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${getStatusColor(agent.status)}`}
                    >
                      {displayStatus[agent.status] ?? agent.status}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {agent.model}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mt-auto pt-3 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      {formatNumber(agent.totalChats)}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      v{agent.version}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto truncate">
                      {agent.owner}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2">
                    <Clock className="h-3 w-3" />
                    Last active: {formatRelativeTime(agent.lastTraining)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 w-10">
                      <input
                        type="checkbox"
                        checked={
                          paged.length > 0 &&
                          selected.size === paged.length
                        }
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                      />
                    </th>
                    {[
                      { key: "name" as SortField, label: "Agent", className: "text-left" },
                      { key: null, label: "Category", className: "text-left" },
                      { key: null, label: "Model", className: "text-left" },
                      { key: null, label: "Status", className: "text-left" },
                      { key: null, label: "Version", className: "text-left" },
                      { key: "totalChats" as SortField, label: "Chats", className: "text-right" },
                      { key: "createdAt" as SortField, label: "Created", className: "text-left" },
                      { key: null, label: "Owner", className: "text-left" },
                      { key: null, label: "", className: "w-10" },
                    ].map((col, ci) => (
                      <th
                        key={ci}
                        className={`p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider ${
                          col.className
                        } ${col.key ? "cursor-pointer select-none hover:text-foreground transition-colors" : ""}`}
                        onClick={
                          col.key ? () => toggleSort(col.key!) : undefined
                        }
                      >
                        <span className="inline-flex items-center gap-1">
                          {col.label}
                          {col.key && sortField === col.key && (
                            <ChevronDown
                              className={`h-3 w-3 transition-transform ${
                                sortDir === "desc" ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((agent) => (
                    <tr
                      key={agent.id}
                      className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.has(agent.id)}
                          onChange={() => toggleRow(agent.id)}
                          className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: agent.avatarColor }}
                          >
                            {agent.name.charAt(0)}
                          </div>
                          <span className="font-medium truncate max-w-[180px]">
                            {agent.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px]">
                          {agent.category}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className="text-[10px]">
                          {agent.model}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${getStatusColor(agent.status)}`}
                        >
                          {displayStatus[agent.status] ?? agent.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        v{agent.version}
                      </td>
                      <td className="p-3 text-right text-xs text-muted-foreground">
                        {formatNumber(agent.totalChats)}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {formatDate(agent.createdAt)}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {agent.owner}
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="h-3.5 w-3.5" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Pencil className="h-3.5 w-3.5" />
                              Edit Agent
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Copy className="h-3.5 w-3.5" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Loader2 className="h-3.5 w-3.5" />
                              Retrain
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {paged.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No agents found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {startIdx}–{endIdx}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {filtered.length}
            </span>{" "}
            agent{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                    p === safePage
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
