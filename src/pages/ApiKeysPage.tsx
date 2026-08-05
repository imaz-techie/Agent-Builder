import { useState } from "react";
import { motion } from "framer-motion";
import {
  Key,
  Plus,
  Copy,
  RefreshCw,
  Trash2,
  MoreVertical,
  Shield,
  Info,
  Send,
  Zap,
  Activity,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { apiKeys as mockApiKeys } from "@/lib/mock-data";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { useApiKeysQuery } from "@/hooks/queries/useApiKeyQueries";
import {
  useCreateApiKeyMutation,
  useDeleteApiKeyMutation,
} from "@/hooks/mutations/useApiKeyMutations";

const permissionColors: Record<string, string> = {
  read: "bg-info/10 text-info",
  write: "bg-warning/10 text-warning",
  admin: "bg-destructive/10 text-destructive",
};

export default function ApiKeysPage() {
  const { data: apiKeys = mockApiKeys } = useApiKeysQuery();
  const createApiKeyMutation = useCreateApiKeyMutation();
  const deleteApiKeyMutation = useDeleteApiKeyMutation();

  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showCopied, setShowCopied] = useState<string | null>(null);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [_selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState(
    "https://api.agentmax.ai/webhooks/v1/events",
  );
  const [testingWebhook, setTestingWebhook] = useState(false);

  const handleCopyKey = (keyId: string) => {
    setShowCopied(keyId);
    setTimeout(() => setShowCopied(null), 2000);
  };

  const handleRegenerate = (keyId: string) => {
    setSelectedKeyId(keyId);
    setShowRegenerateDialog(true);
  };

  const handleRevoke = (keyId: string) => {
    setSelectedKeyId(keyId);
    setShowRevokeDialog(true);
  };

  const handleTestWebhook = () => {
    setTestingWebhook(true);
    setTimeout(() => setTestingWebhook(false), 2000);
  };

  const rateLimitUsed = 847;
  const rateLimitMax = 1000;
  const requestsToday = 12847;
  const remainingQuota = 87153;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-wrap gap-3"
        >
          <div>
            <h1 className="text-2xl font-bold">API Keys</h1>
            <p className="text-sm text-muted-foreground">
              Manage API keys for programmatic access to AgentMax.
            </p>
          </div>
          <Button className="gap-2" onClick={() => setShowNewKey(true)}>
            <Plus className="h-4 w-4" />
            Generate New Key
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-start gap-3 rounded-xl border border-info/20 bg-info/5 p-4">
            <Info className="h-5 w-5 text-info shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">API Key Usage</p>
              <p className="text-muted-foreground mt-0.5">
                Use API keys to authenticate requests to the AgentMax API. Each
                key can be scoped with specific permissions (read, write,
                admin). Keep your keys secure and never expose them in
                client-side code.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                Active Keys
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                        Name
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                        Key
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                        Permissions
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                        Last Used
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                        Created
                      </th>
                      <th className="text-right text-xs font-medium text-muted-foreground pb-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((apiKey, i) => (
                      <motion.tr
                        key={apiKey.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.05 }}
                        className="border-b border-border last:border-0 group"
                      >
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Key className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium">
                              {apiKey.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">
                              {apiKey.keyPreview}
                            </code>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleCopyKey(apiKey.id)}
                                  className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                >
                                  {showCopied === apiKey.id ? (
                                    <span className="text-[10px] font-medium text-success">
                                      Copied
                                    </span>
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Copy key</TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {apiKey.permissions.map((p) => (
                              <Badge
                                key={p}
                                variant="secondary"
                                className={`text-[10px] capitalize gap-1 ${permissionColors[p] || ""}`}
                              >
                                <Shield className="h-2.5 w-2.5" />
                                {p}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(apiKey.lastUsed)}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(apiKey.createdAt)}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => handleCopyKey(apiKey.id)}
                              >
                                <Copy className="h-3.5 w-3.5" /> Copy Key
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => handleRegenerate(apiKey.id)}
                              >
                                <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="gap-2 text-destructive focus:text-destructive"
                                onClick={() => handleRevoke(apiKey.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Revoke Key
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    Rate Limit
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {rateLimitUsed}/{rateLimitMax}/min
                  </span>
                </div>
                <Progress
                  value={(rateLimitUsed / rateLimitMax) * 100}
                  className="h-2"
                  indicatorClassName={
                    rateLimitUsed / rateLimitMax > 0.8
                      ? "bg-warning"
                      : "bg-primary"
                  }
                />
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    Requests Today
                  </div>
                  <span className="text-lg font-bold">
                    {requestsToday.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  +12.3% from yesterday
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    Remaining Quota
                  </div>
                  <span className="text-lg font-bold">
                    {remainingQuota.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Resets at midnight UTC
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4 text-muted-foreground" />
                Webhook URL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Receive real-time event notifications via webhook. Configure
                your endpoint to receive events for conversations, training
                completions, and more.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="https://your-server.com/webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  className="gap-2 shrink-0"
                  onClick={handleTestWebhook}
                  disabled={testingWebhook}
                >
                  {testingWebhook ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Test
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Dialog open={showNewKey} onOpenChange={setShowNewKey}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key for programmatic access to the AgentMax
                API.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Key Name</Label>
                <Input
                  placeholder="e.g., Production API Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  A descriptive name helps you identify this key later.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="flex gap-2">
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/10"
                  >
                    <Shield className="h-2.5 w-2.5 mr-1" />
                    read
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/10"
                  >
                    <Shield className="h-2.5 w-2.5 mr-1" />
                    write
                  </Badge>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewKey(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowNewKey(false)}>Generate Key</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={showRegenerateDialog}
          onOpenChange={setShowRegenerateDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Regenerate API Key</DialogTitle>
              <DialogDescription>
                This will invalidate the existing key and generate a new one.
                Any applications using the old key will stop working
                immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border border-warning/20 bg-warning/5 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. Make sure to update all
                integrations with the new key.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRegenerateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRegenerateDialog(false)}
              >
                Regenerate Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Revoke API Key</DialogTitle>
              <DialogDescription>
                Are you sure you want to revoke this API key? This action is
                permanent and cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                All requests using this key will immediately be rejected.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRevokeDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRevokeDialog(false)}
              >
                Revoke Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
