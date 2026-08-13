import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Settings,
  Bell,
  Shield,
  PaletteIcon,
  Trash2,
  Loader2,
  MessageSquare,
  GraduationCap,
  Rocket,
  CreditCard,
  AlertTriangle,
  Laptop,
  Smartphone,
  MapPin,
  X,
  Globe,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useActiveWorkspaceId } from "@/hooks/queries/useWorkspaceQueries";
import { useWorkspaceQuery } from "@/hooks/queries/useWorkspaceQueries";
import {
  useUpdateWorkspaceMutation,
  useUpdateWorkspaceBrandingMutation,
  useUpdateWorkspaceSecurityMutation,
  useDeleteWorkspaceMutation,
} from "@/hooks/mutations/useWorkspaceMutations";
import { useProfileQuery, useSessionsQuery } from "@/hooks/queries/useAuthQueries";
import { useRevokeSessionMutation } from "@/hooks/mutations/useAuthMutations";
import { TwoFactorCard } from "@/components/profile/TwoFactorCard";
import {
  useNotificationPreferencesQuery,
} from "@/hooks/queries/useNotificationQueries";
import { useUpdateNotificationPreferencesMutation } from "@/hooks/mutations/useNotificationMutations";
import { useAgentsQuery } from "@/hooks/queries/useAgentQueries";
import { useWidgetConfigQuery } from "@/hooks/queries/useWidgetQueries";
import { useUpsertWidgetConfigMutation } from "@/hooks/mutations/useWidgetMutations";
import type {
  NotificationType,
  NotificationChannel,
} from "@/types/notification.types";
import type {
  WidgetTheme,
  WidgetLauncherPosition,
} from "@/types/widget.types";
import { WIDGET_THEMES } from "@/types/widget.types";

const tabs = [
  { id: "workspace", label: "Workspace", icon: Settings },
  { id: "branding", label: "Branding", icon: PaletteIcon },
  { id: "widget", label: "Widget Theme", icon: MessageSquare },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "danger", label: "Danger Zone", icon: Trash2 },
] as const;

type TabId = (typeof tabs)[number]["id"];

const PRIMARY_PRESETS = [
  "#6366f1",
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
];

const ACCENT_PRESETS = [
  "#a855f7",
  "#8b5cf6",
  "#06b6d4",
  "#14b8a6",
  "#f97316",
  "#e11d48",
];

const NOTIFICATION_TYPES: {
  type: NotificationType;
  label: string;
  description: string;
  icon: typeof MessageSquare;
}[] = [
  {
    type: "SYSTEM",
    label: "System Updates",
    description: "Maintenance, version updates, and platform announcements",
    icon: Settings,
  },
  {
    type: "AGENT",
    label: "Agent Activity",
    description: "Agent creation, updates, and status changes",
    icon: MessageSquare,
  },
  {
    type: "WORKSPACE",
    label: "Workspace",
    description: "Workspace changes and member activity",
    icon: Globe,
  },
  {
    type: "BILLING",
    label: "Billing Alerts",
    description: "Invoices, payment failures, and plan changes",
    icon: CreditCard,
  },
  {
    type: "TRAINING",
    label: "Training",
    description: "Agent training progress and completion",
    icon: GraduationCap,
  },
  {
    type: "DEPLOYMENT",
    label: "Deployments",
    description: "Deployment creation and status changes",
    icon: Rocket,
  },
];

const NOTIFICATION_CHANNELS: { channel: NotificationChannel; label: string }[] = [
  { channel: "IN_APP", label: "In-app" },
  { channel: "EMAIL", label: "Email" },
];

const WIDGET_DEFAULTS = {
  title: "Chat with us",
  welcomeMessage: "Hi! How can we help you today?",
  theme: "LIGHT" as WidgetTheme,
  primaryColor: "#6366f1",
  launcherPosition: "BOTTOM_RIGHT" as WidgetLauncherPosition,
  launcherSize: 56,
  showAvatar: true,
  allowFileUpload: false,
  enableRag: true,
  customDomain: "",
};

function parseDeviceLabel(userAgent: string): string {
  if (/iPhone/.test(userAgent)) return "iPhone";
  if (/Android/.test(userAgent)) return "Android Device";
  if (/Mac|iPad/.test(userAgent)) return "Mac";
  if (/Windows/.test(userAgent)) return "Windows PC";
  if (/Linux/.test(userAgent)) return "Linux";
  return "Unknown device";
}

function formatSessionDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<TabId>(
    tabs.some((tab) => tab.id === requestedTab)
      ? (requestedTab as TabId)
      : "workspace"
  );

  const workspaceId = useActiveWorkspaceId();
  const {
    data: workspace,
    isLoading: workspaceLoading,
    isError: workspaceError,
  } = useWorkspaceQuery(workspaceId);

  const updateWorkspace = useUpdateWorkspaceMutation(workspaceId);
  const updateBranding = useUpdateWorkspaceBrandingMutation(workspaceId);
  const updateSecurity = useUpdateWorkspaceSecurityMutation(workspaceId);
  const deleteWorkspace = useDeleteWorkspaceMutation();

  const [workspaceName, setWorkspaceName] = useState("");
  useEffect(() => {
    if (workspace) setWorkspaceName(workspace.name);
  }, [workspace]);

  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [accentColor, setAccentColor] = useState("#a855f7");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [bannerText, setBannerText] = useState("");
  useEffect(() => {
    if (workspace?.branding) {
      setPrimaryColor(workspace.branding.primaryColor || "#6366f1");
      setAccentColor(workspace.branding.accentColor || "#a855f7");
      setFaviconUrl(workspace.branding.faviconUrl || "");
      setBannerText(workspace.branding.bannerText || "");
    }
  }, [workspace?.branding]);

  const { data: agents } = useAgentsQuery({ limit: 100 });
  const [widgetAgentId, setWidgetAgentId] = useState("");
  useEffect(() => {
    if (!widgetAgentId && agents && agents.length > 0) {
      setWidgetAgentId(agents[0].id);
    }
  }, [agents, widgetAgentId]);

  const { data: widgetConfig, isLoading: widgetLoading } =
    useWidgetConfigQuery(widgetAgentId);
  const upsertWidget = useUpsertWidgetConfigMutation(widgetAgentId);

  const [widgetForm, setWidgetForm] = useState(WIDGET_DEFAULTS);
  useEffect(() => {
    if (widgetConfig) {
      setWidgetForm({
        title: widgetConfig.title,
        welcomeMessage: widgetConfig.welcomeMessage,
        theme: widgetConfig.theme,
        primaryColor: widgetConfig.primaryColor,
        launcherPosition: widgetConfig.launcherPosition,
        launcherSize: widgetConfig.launcherSize,
        showAvatar: widgetConfig.showAvatar,
        allowFileUpload: widgetConfig.allowFileUpload,
        enableRag: widgetConfig.enableRag,
        customDomain: widgetConfig.customDomain || "",
      });
    }
  }, [widgetConfig]);

  const { data: preferences } = useNotificationPreferencesQuery();
  const updatePreferences = useUpdateNotificationPreferencesMutation();
  const preferenceMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const pref of preferences ?? []) {
      map[`${pref.type}:${pref.channel}`] = pref.enabled;
    }
    return map;
  }, [preferences]);
  const togglePreference = (type: NotificationType, channel: NotificationChannel, enabled: boolean) => {
    updatePreferences.mutate({ preferences: [{ type, channel, enabled }] });
  };

  const { data: profile } = useProfileQuery();
  const twoFAEnabled = profile?.twoFactorEnabled ?? false;

  const { data: sessions } = useSessionsQuery();
  const revokeSession = useRevokeSessionMutation();

  const [whitelistDraft, setWhitelistDraft] = useState("");
  const [whitelist, setWhitelist] = useState<string[]>([]);
  useEffect(() => {
    if (workspace) setWhitelist(workspace.ipWhitelist ?? []);
  }, [workspace]);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const addIP = () => {
    const trimmed = whitelistDraft.trim();
    if (trimmed && !whitelist.includes(trimmed)) {
      setWhitelist([...whitelist, trimmed]);
      setWhitelistDraft("");
    }
  };

  const removeIP = (ip: string) => {
    setWhitelist(whitelist.filter((i) => i !== ip));
  };

  const saveWhitelist = () => {
    updateSecurity.mutate({ ipWhitelist: whitelist });
  };

  const isAdmin = workspace?.memberRole === "ADMIN" || workspace?.memberRole === "OWNER";

  return (
    <div className="max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your workspace, branding, and preferences.
        </p>
      </motion.div>

      <div className="flex gap-6">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="w-56 shrink-0"
        >
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                } ${tab.id === "danger" ? "text-destructive hover:text-destructive hover:bg-destructive/5" : ""}`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </motion.div>

        <div className="flex-1 min-w-0">
          {workspaceLoading && !workspace && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {workspaceError && !workspace && (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-muted-foreground">
                Unable to load workspace settings. Please try again later.
              </p>
            </div>
          )}

          {activeTab === "workspace" && workspace && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Workspace Settings</CardTitle>
                  <CardDescription>
                    Manage your workspace configuration.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Workspace Name</Label>
                      <Input
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Workspace Slug</Label>
                      <Input value={workspace.slug} disabled />
                      <p className="text-xs text-muted-foreground">
                        Used in widget and API URLs. Not editable.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Logo URL</Label>
                      <Input
                        placeholder="https://..."
                        defaultValue={workspace.logoUrl ?? ""}
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (value !== (workspace.logoUrl ?? "")) {
                            updateWorkspace.mutate({ logoUrl: value });
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Your Role</Label>
                      <Input value={workspace.memberRole} disabled />
                      <p className="text-xs text-muted-foreground">
                        {workspace.memberCount} member
                        {workspace.memberCount === 1 ? "" : "s"} in this workspace.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() =>
                        updateWorkspace.mutate({ name: workspaceName })
                      }
                      disabled={!workspaceName.trim() || updateWorkspace.isPending}
                    >
                      {updateWorkspace.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "branding" && workspace && (
            <motion.div
              key="branding"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Brand Identity</CardTitle>
                  <CardDescription>
                    Customize your workspace branding and visual identity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Favicon URL</Label>
                    <Input
                      placeholder="https://..."
                      value={faviconUrl}
                      onChange={(e) => setFaviconUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Shown in the browser tab for your widget domain.
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label>Primary Color</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="h-10 w-10 rounded-lg border border-border cursor-pointer appearance-none"
                        />
                        <Input
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="font-mono text-sm w-32"
                        />
                        <div className="flex gap-1.5">
                          {PRIMARY_PRESETS.map((color) => (
                            <button
                              key={color}
                              onClick={() => setPrimaryColor(color)}
                              className="h-6 w-6 rounded-full border-2 border-border hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label>Accent Color</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="h-10 w-10 rounded-lg border border-border cursor-pointer appearance-none"
                        />
                        <Input
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="font-mono text-sm w-32"
                        />
                        <div className="flex gap-1.5">
                          {ACCENT_PRESETS.map((color) => (
                            <button
                              key={color}
                              onClick={() => setAccentColor(color)}
                              className="h-6 w-6 rounded-full border-2 border-border hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Banner Text</Label>
                    <Input
                      placeholder="e.g. Powered by Acme Corp"
                      value={bannerText}
                      onChange={(e) => setBannerText(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional text displayed in your widget banner (max 120 chars).
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() =>
                        updateBranding.mutate({
                          primaryColor,
                          accentColor,
                          faviconUrl,
                          bannerText,
                        })
                      }
                      disabled={updateBranding.isPending}
                    >
                      {updateBranding.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      )}
                      Save Branding
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "widget" && (
            <motion.div
              key="widget"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Widget Appearance</CardTitle>
                  <CardDescription>
                    Customize how the chat widget appears for a selected agent.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label>Agent</Label>
                    {agents && agents.length > 0 ? (
                      <Select value={widgetAgentId} onValueChange={setWidgetAgentId}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                              {agent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No agents found. Create an agent first to customize its
                        widget.
                      </p>
                    )}
                  </div>

                  {widgetLoading && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  {!widgetLoading && widgetAgentId && widgetConfig && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Widget Title</Label>
                          <Input
                            value={widgetForm.title}
                            onChange={(e) =>
                              setWidgetForm({ ...widgetForm, title: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Theme</Label>
                          <Select
                            value={widgetForm.theme}
                            onValueChange={(value) =>
                              setWidgetForm({ ...widgetForm, theme: value as WidgetTheme })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {WIDGET_THEMES.map((theme) => (
                                <SelectItem key={theme} value={theme}>
                                  {theme.charAt(0) + theme.slice(1).toLowerCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Welcome Message</Label>
                        <Input
                          value={widgetForm.welcomeMessage}
                          onChange={(e) =>
                            setWidgetForm({
                              ...widgetForm,
                              welcomeMessage: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label>Primary Color</Label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={widgetForm.primaryColor}
                              onChange={(e) =>
                                setWidgetForm({
                                  ...widgetForm,
                                  primaryColor: e.target.value,
                                })
                              }
                              className="h-10 w-10 rounded-lg border border-border cursor-pointer appearance-none"
                            />
                            <Input
                              value={widgetForm.primaryColor}
                              onChange={(e) =>
                                setWidgetForm({
                                  ...widgetForm,
                                  primaryColor: e.target.value,
                                })
                              }
                              className="font-mono text-sm w-32"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Launcher Position</Label>
                          <Select
                            value={widgetForm.launcherPosition}
                            onValueChange={(value) =>
                              setWidgetForm({
                                ...widgetForm,
                                launcherPosition: value as WidgetLauncherPosition,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BOTTOM_RIGHT">Bottom Right</SelectItem>
                              <SelectItem value="BOTTOM_LEFT">Bottom Left</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Custom Domain</Label>
                          <Input
                            placeholder="chat.example.com"
                            value={widgetForm.customDomain}
                            onChange={(e) =>
                              setWidgetForm({
                                ...widgetForm,
                                customDomain: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Launcher Size</Label>
                          <Input
                            type="number"
                            min={40}
                            max={96}
                            value={widgetForm.launcherSize}
                            onChange={(e) =>
                              setWidgetForm({
                                ...widgetForm,
                                launcherSize: Number(e.target.value) || 56,
                              })
                            }
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Agent Avatar</Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Display the agent avatar in the widget header.
                            </p>
                          </div>
                          <Switch
                            checked={widgetForm.showAvatar}
                            onCheckedChange={(checked) =>
                              setWidgetForm({ ...widgetForm, showAvatar: checked })
                            }
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Allow File Upload</Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Let visitors attach files in conversation.
                            </p>
                          </div>
                          <Switch
                            checked={widgetForm.allowFileUpload}
                            onCheckedChange={(checked) =>
                              setWidgetForm({ ...widgetForm, allowFileUpload: checked })
                            }
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable RAG</Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Answer questions using the agent knowledge base.
                            </p>
                          </div>
                          <Switch
                            checked={widgetForm.enableRag}
                            onCheckedChange={(checked) =>
                              setWidgetForm({ ...widgetForm, enableRag: checked })
                            }
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={() =>
                            upsertWidget.mutate({
                              title: widgetForm.title,
                              welcomeMessage: widgetForm.welcomeMessage,
                              theme: widgetForm.theme,
                              primaryColor: widgetForm.primaryColor,
                              launcherPosition: widgetForm.launcherPosition,
                              launcherSize: widgetForm.launcherSize,
                              showAvatar: widgetForm.showAvatar,
                              allowFileUpload: widgetForm.allowFileUpload,
                              enableRag: widgetForm.enableRag,
                              customDomain: widgetForm.customDomain || null,
                            })
                          }
                          disabled={upsertWidget.isPending}
                        >
                          {upsertWidget.isPending && (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          )}
                          Save Widget Config
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose which notifications you'd like to receive.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  {NOTIFICATION_TYPES.map((setting, i) => (
                    <div
                      key={setting.type}
                      className={`flex items-center justify-between py-4 ${
                        i < NOTIFICATION_TYPES.length - 1 ? "border-b border-border" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <setting.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">{setting.label}</Label>
                          <p className="text-xs text-muted-foreground">
                            {setting.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {NOTIFICATION_CHANNELS.map((channel) => (
                          <div key={channel.channel} className="flex items-center gap-2">
                            <Switch
                              checked={
                                preferenceMap[`${setting.type}:${channel.channel}`] ?? false
                              }
                              disabled={updatePreferences.isPending}
                              onCheckedChange={(checked) =>
                                togglePreference(setting.type, channel.channel, checked)
                              }
                            />
                            <span className="text-xs text-muted-foreground">
                              {channel.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TwoFactorCard enabled={twoFAEnabled} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Active Sessions</CardTitle>
                  <CardDescription>
                    Devices that are currently signed in to your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sessions && sessions.length > 0 ? (
                    <div className="space-y-4">
                      {sessions.map((session, i) => (
                        <div
                          key={session.id}
                          className={`flex items-center justify-between py-3 ${
                            i < sessions.length - 1 ? "border-b border-border" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {session.userAgent && /iPhone|Android/i.test(session.userAgent) ? (
                              <Smartphone className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Laptop className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div>
                              <p className="text-sm font-medium">
                                {session.userAgent
                                  ? parseDeviceLabel(session.userAgent)
                                  : "Unknown device"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {session.ipAddress ?? "Unknown IP"} &middot; Signed in{" "}
                                {formatSessionDate(session.createdAt)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Expires {formatSessionDate(session.expiresAt)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            disabled={revokeSession.isPending}
                            onClick={() => revokeSession.mutate(session.id)}
                          >
                            Revoke
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">
                      No active sessions found.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">IP Whitelist</CardTitle>
                  <CardDescription>
                    Restrict API access to specific IP addresses or CIDR ranges.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Input
                      placeholder="e.g., 192.168.1.0/24"
                      value={whitelistDraft}
                      onChange={(e) => setWhitelistDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addIP();
                      }}
                    />
                    <Button variant="outline" onClick={addIP} className="shrink-0">
                      Add IP
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {whitelist.length > 0 ? (
                      whitelist.map((ip) => (
                        <Badge
                          key={ip}
                          variant="secondary"
                          className="gap-1.5 pr-1.5 text-xs"
                        >
                          <MapPin className="h-3 w-3" />
                          {ip}
                          <button
                            onClick={() => removeIP(ip)}
                            className="ml-1 h-4 w-4 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No IPs whitelisted. API access is unrestricted.
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={saveWhitelist}
                      disabled={updateSecurity.isPending}
                    >
                      {updateSecurity.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      )}
                      Save Whitelist
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "danger" && (
            <motion.div
              key="danger"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="text-base text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions. Proceed with extreme
                    caution.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Delete Workspace</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Permanently delete this workspace and all its data
                          including agents, knowledge bases, and conversation
                          history.
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        disabled={!isAdmin}
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Workspace
                      </Button>
                    </div>
                    {!isAdmin && (
                      <p className="text-xs text-destructive mt-2">
                        Only owners and admins can delete this workspace.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-destructive">
                      Delete Workspace
                    </DialogTitle>
                    <DialogDescription>
                      This action is permanent and cannot be undone. All data
                      including agents, knowledge bases, conversations, and
                      settings will be permanently deleted.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                      <p className="text-sm text-muted-foreground">
                        Please type{" "}
                        <span className="font-bold text-foreground">DELETE</span>{" "}
                        to confirm.
                      </p>
                    </div>
                    <Input
                      placeholder='Type "DELETE" to confirm'
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      className="border-destructive/30 focus-visible:ring-destructive"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteDialog(false);
                        setDeleteConfirm("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={deleteConfirm !== "DELETE" || deleteWorkspace.isPending}
                      onClick={() => {
                        deleteWorkspace.mutate(workspaceId, {
                          onSuccess: () => {
                            setShowDeleteDialog(false);
                            setDeleteConfirm("");
                            navigate("/");
                          },
                        });
                      }}
                    >
                      {deleteWorkspace.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      )}
                      Delete Workspace
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
