import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  Search,
  FileText,
  File,
  FileSpreadsheet,
  FileJson,
  FileCode,
  MoreVertical,
  CheckCircle2,
  Loader2,
  XCircle,
  Globe,
  BookOpen,
  HardDrive,
  Share2,
  GitBranch,
  Database,
  ArrowUpDown,
  Eye,
  Download,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { knowledgeFiles, type KnowledgeFileType, type KnowledgeFileStatus } from "@/lib/mock-data";
import { formatRelativeTime, cn, formatNumber } from "@/lib/utils";

const fileIcons: Record<string, React.ElementType> = {
  pdf: FileText,
  docx: File,
  txt: FileCode,
  csv: FileSpreadsheet,
  md: FileCode,
  json: FileJson,
};

const fileIconColors: Record<string, string> = {
  pdf: "text-red-500 bg-red-500/10",
  docx: "text-blue-500 bg-blue-500/10",
  txt: "text-zinc-500 bg-zinc-500/10",
  csv: "text-emerald-500 bg-emerald-500/10",
  md: "text-purple-500 bg-purple-500/10",
  json: "text-amber-500 bg-amber-500/10",
};

const statusConfig: Record<
  KnowledgeFileStatus,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  indexed: {
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    label: "Ready",
  },
  processing: {
    icon: Loader2,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    label: "Processing",
  },
  failed: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    label: "Error",
  },
};

const integrations = [
  { name: "Website Crawl", description: "Scrape and index web pages automatically", icon: Globe, color: "text-blue-500 bg-blue-500/10", connected: true },
  { name: "Notion", description: "Import pages and databases from Notion", icon: BookOpen, color: "text-zinc-700 bg-zinc-700/10 dark:text-zinc-300", connected: false },
  { name: "Google Drive", description: "Sync documents from Google Drive", icon: HardDrive, color: "text-emerald-500 bg-emerald-500/10", connected: true },
  { name: "SharePoint", description: "Connect to Microsoft SharePoint sites", icon: Share2, color: "text-blue-600 bg-blue-600/10", connected: false },
  { name: "GitHub", description: "Import repos, wikis, and documentation", icon: GitBranch, color: "text-gray-800 bg-gray-800/10 dark:text-gray-200", connected: false },
  { name: "Confluence", description: "Sync Confluence pages and spaces", icon: BookOpen, color: "text-sky-500 bg-sky-500/10", connected: false },
];

type SortKey = "name" | "type" | "status" | "chunks" | "size" | "uploadedAt";

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("uploadedAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("Dropped files:", acceptedFiles);
    setIsDragActive(false);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "text/csv": [".csv"],
      "application/json": [".json"],
      "text/markdown": [".md"],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const filteredFiles = knowledgeFiles
    .filter((f) => {
      const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || f.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "type") cmp = a.type.localeCompare(b.type);
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else if (sortKey === "chunks") cmp = a.chunks - b.chunks;
      else if (sortKey === "size") cmp = a.size.localeCompare(b.size);
      else if (sortKey === "uploadedAt") cmp = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      return sortAsc ? cmp : -cmp;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const totalChunks = knowledgeFiles.reduce((acc, f) => acc + f.chunks, 0);
  const totalEmbeddings = totalChunks * 126;
  const totalSizeBytes = 2.3 * 1024 * 1024 * 1024;

  const stats = [
    { label: "Total Files", value: knowledgeFiles.length, icon: Database, color: "text-blue-500 bg-blue-500/10" },
    { label: "Total Chunks", value: formatNumber(totalChunks), icon: FileText, color: "text-purple-500 bg-purple-500/10" },
    { label: "Embeddings", value: formatNumber(totalEmbeddings), icon: HardDrive, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Storage Used", value: "2.3 GB", icon: HardDrive, color: "text-amber-500 bg-amber-500/10" },
  ];

  const filterTypes = [
    { label: "All", value: "all" },
    { label: "PDF", value: "pdf" },
    { label: "DOCX", value: "docx" },
    { label: "TXT", value: "txt" },
    { label: "CSV", value: "csv" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your training data and knowledge sources
          </p>
        </div>
        <Button className="gap-2 shadow-sm">
          <Upload className="h-4 w-4" />
          Upload Files
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
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

      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Integration Sources</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Connect external data sources to keep your knowledge base fresh</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration, i) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 + i * 0.05 }}
            >
              <Card className="hover:shadow-md transition-all hover:border-border/80">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", integration.color)}>
                        <integration.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{integration.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px]">{integration.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    {integration.connected ? (
                      <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/20 gap-1.5">
                        <CheckCircle2 className="h-3 w-3" />
                        Connected
                      </Badge>
                    ) : (
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200",
            isDragActive
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-muted-foreground/25 hover:border-muted-foreground/40 hover:bg-muted/30"
          )}
        >
          <input {...getInputProps()} />
          <motion.div
            animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex flex-col items-center gap-3"
          >
            <div className={cn(
              "h-14 w-14 rounded-2xl flex items-center justify-center transition-colors",
              isDragActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              <Upload className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {isDragActive ? "Drop files here" : "Drop files here or click to browse"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports PDF, DOCX, TXT, CSV, JSON, Markdown (max 50MB)
              </p>
            </div>
            <Button variant="secondary" size="sm" className="mt-1">
              Browse Files
            </Button>
          </motion.div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-tight">Uploaded Files</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {filterTypes.map((ft) => (
            <Button
              key={ft.value}
              variant={typeFilter === ft.value ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setTypeFilter(ft.value)}
            >
              {ft.label}
            </Button>
          ))}
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    { key: "name" as SortKey, label: "File" },
                    { key: "type" as SortKey, label: "Type" },
                    { key: "status" as SortKey, label: "Status" },
                    { key: "chunks" as SortKey, label: "Chunks" },
                    { key: "size" as SortKey, label: "Size" },
                    { key: "uploadedAt" as SortKey, label: "Uploaded" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className="text-left px-4 py-3 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                      onClick={() => toggleSort(col.key)}
                    >
                      <span className="flex items-center gap-1.5">
                        {col.label}
                        <ArrowUpDown className={cn("h-3 w-3", sortKey === col.key ? "text-foreground" : "opacity-30")} />
                      </span>
                    </th>
                  ))}
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-10">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredFiles.map((file, i) => {
                    const Icon = fileIcons[file.type] || FileText;
                    const iconColor = fileIconColors[file.type] || "text-muted-foreground bg-muted";
                    const status = statusConfig[file.status];
                    const StatusIcon = status.icon;
                    return (
                      <motion.tr
                        key={file.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25, delay: i * 0.03 }}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", iconColor)}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-sm truncate max-w-[240px]">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                            {file.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] gap-1.5 border", status.bg, status.color)}
                          >
                            <StatusIcon
                              className={cn(
                                "h-3 w-3",
                                file.status === "processing" && "animate-spin"
                              )}
                            />
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium tabular-nums">
                          {file.chunks > 0 ? formatNumber(file.chunks) : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{file.size}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {formatRelativeTime(file.uploadedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <Eye className="h-3.5 w-3.5" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Download className="h-3.5 w-3.5" /> Download
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {filteredFiles.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No files found matching your criteria.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
