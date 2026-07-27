import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Bell,
  Shield,
  PaletteIcon,
  Trash2,
  Save,
  Loader2,
  Upload,
  MessageSquare,
  GraduationCap,
  Rocket,
  CreditCard,
  Monitor,
  UserPlus,
  AlertTriangle,
  Laptop,
  Smartphone,
  MapPin,
  X,
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
import { Textarea } from "@/components/ui/textarea";
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

const tabs = [
  { id: "workspace", label: "Workspace", icon: Settings },
  { id: "branding", label: "Branding", icon: PaletteIcon },
  { id: "widget", label: "Widget Theme", icon: MessageSquare },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "danger", label: "Danger Zone", icon: Trash2 },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("workspace");
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [whitelistedIP, setWhitelistedIP] = useState("");
  const [whitelistedIPs, setWhitelistedIPs] = useState([
    "192.168.1.0/24",
    "10.0.0.0/8",
  ]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  const addIP = () => {
    if (whitelistedIP.trim()) {
      setWhitelistedIPs([...whitelistedIPs, whitelistedIP.trim()]);
      setWhitelistedIP("");
    }
  };

  const removeIP = (ip: string) => {
    setWhitelistedIPs(whitelistedIPs.filter((i) => i !== ip));
  };

  const sessions = [
    {
      id: "1",
      device: "MacBook Pro",
      browser: "Chrome 120",
      ip: "192.168.1.42",
      location: "San Francisco, CA",
      lastActive: "2 minutes ago",
      current: true,
    },
    {
      id: "2",
      device: "iPhone 15 Pro",
      browser: "Safari Mobile",
      ip: "192.168.1.100",
      location: "San Francisco, CA",
      lastActive: "3 hours ago",
      current: false,
    },
    {
      id: "3",
      device: "Windows Desktop",
      browser: "Firefox 121",
      ip: "10.0.0.55",
      location: "New York, NY",
      lastActive: "2 days ago",
      current: false,
    },
  ];

  const notificationSettings = [
    {
      id: "new-conversation",
      label: "New Conversation",
      description: "When a user starts a new conversation with an agent",
      icon: MessageSquare,
      enabled: true,
    },
    {
      id: "training-complete",
      label: "Training Complete",
      description: "When an agent finishes training",
      icon: GraduationCap,
      enabled: true,
    },
    {
      id: "deployment",
      label: "Deployment Updates",
      description: "When a deployment is created or status changes",
      icon: Rocket,
      enabled: true,
    },
    {
      id: "billing-alert",
      label: "Billing Alerts",
      description: "When your invoice is ready or payment fails",
      icon: CreditCard,
      enabled: true,
    },
    {
      id: "weekly-report",
      label: "Weekly Analytics Report",
      description: "Receive a weekly summary of your agents' performance",
      icon: Monitor,
      enabled: false,
    },
    {
      id: "user-signup",
      label: "User Signups",
      description: "When a new user interacts with your agents",
      icon: UserPlus,
      enabled: false,
    },
  ];

  return (
    <div className="max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure your workspace, branding, and preferences.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
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
          {activeTab === "workspace" && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Workspace Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your workspace configuration.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Workspace Name</Label>
                      <Input defaultValue="AgentMax Workspace" />
                    </div>
                    <div className="space-y-2">
                      <Label>Workspace URL</Label>
                      <div className="flex">
                        <span className="inline-flex items-center rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                          app.agentmax.ai/
                        </span>
                        <Input
                          defaultValue="my-workspace"
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select defaultValue="pst">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utc">UTC</SelectItem>
                          <SelectItem value="est">Eastern Time (ET)</SelectItem>
                          <SelectItem value="cst">Central Time (CT)</SelectItem>
                          <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                          <SelectItem value="cet">
                            Central European Time (CET)
                          </SelectItem>
                          <SelectItem value="jst">
                            Japan Standard Time (JST)
                          </SelectItem>
                          <SelectItem value="ist">
                            India Standard Time (IST)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="ja">Japanese</SelectItem>
                          <SelectItem value="pt">Portuguese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "branding" && (
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
                    <Label>Custom Logo</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        SVG, PNG, or JPG (max 2MB)
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label>Primary Color</Label>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <input
                            type="color"
                            defaultValue="#6366f1"
                            className="h-10 w-10 rounded-lg border border-border cursor-pointer appearance-none"
                          />
                        </div>
                        <Input
                          defaultValue="#6366f1"
                          className="font-mono text-sm w-32"
                        />
                        <div className="flex gap-1.5">
                          {[
                            "#6366f1",
                            "#3b82f6",
                            "#22c55e",
                            "#f59e0b",
                            "#ef4444",
                            "#ec4899",
                          ].map((color) => (
                            <button
                              key={color}
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
                        <div className="relative">
                          <input
                            type="color"
                            defaultValue="#a855f7"
                            className="h-10 w-10 rounded-lg border border-border cursor-pointer appearance-none"
                          />
                        </div>
                        <Input
                          defaultValue="#a855f7"
                          className="font-mono text-sm w-32"
                        />
                        <div className="flex gap-1.5">
                          {[
                            "#a855f7",
                            "#8b5cf6",
                            "#06b6d4",
                            "#14b8a6",
                            "#f97316",
                            "#e11d48",
                          ].map((color) => (
                            <button
                              key={color}
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
                    <Label>Custom CSS</Label>
                    <Textarea
                      placeholder="/* Add your custom CSS overrides here */"
                      className="font-mono text-xs min-h-[140px]"
                      defaultValue={`:root {\n  --brand-radius: 0.75rem;\n  --brand-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);\n}`}
                    />
                    <p className="text-xs text-muted-foreground">
                      Advanced: Override default styles with custom CSS
                      variables.
                    </p>
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
                    Customize how the chat widget appears to your users.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Chat Position</Label>
                      <Select defaultValue="bottom-right">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottom-right">
                            Bottom Right
                          </SelectItem>
                          <SelectItem value="bottom-left">
                            Bottom Left
                          </SelectItem>
                          <SelectItem value="top-right">Top Right</SelectItem>
                          <SelectItem value="top-left">Top Left</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Font Family</Label>
                      <Select defaultValue="inter">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inter">Inter</SelectItem>
                          <SelectItem value="system">System Default</SelectItem>
                          <SelectItem value="roboto">Roboto</SelectItem>
                          <SelectItem value="poppins">Poppins</SelectItem>
                          <SelectItem value="open-sans">Open Sans</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Greeting Message</Label>
                    <Input
                      defaultValue="Hi! How can we help you today?"
                      placeholder="Enter a greeting message"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Placeholder Text</Label>
                    <Input
                      defaultValue="Type your message..."
                      placeholder="Input placeholder text"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Working Hours</CardTitle>
                  <CardDescription>
                    Define when agents are available for live chat.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Working Hours</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Show offline message outside business hours
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Start Time
                      </Label>
                      <Input type="time" defaultValue="09:00" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        End Time
                      </Label>
                      <Input type="time" defaultValue="18:00" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Support Email</Label>
                    <Input
                      type="email"
                      defaultValue="support@agentmax.ai"
                      placeholder="support@company.com"
                    />
                  </div>
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
                  <CardTitle className="text-base">
                    Email Notifications
                  </CardTitle>
                  <CardDescription>
                    Choose which email notifications you'd like to receive.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  {notificationSettings.map((setting, i) => (
                    <div
                      key={setting.id}
                      className={`flex items-center justify-between py-4 ${
                        i < notificationSettings.length - 1
                          ? "border-b border-border"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <setting.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            {setting.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {setting.description}
                          </p>
                        </div>
                      </div>
                      <Switch defaultChecked={setting.enabled} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Real-time Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure in-app notification preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Browser Notifications</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sound Alerts</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Play a sound when receiving notifications
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Daily Digest</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Receive a daily summary of all activity
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
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
                  <CardTitle className="text-base">
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          twoFAEnabled ? "bg-success/10" : "bg-muted"
                        }`}
                      >
                        <Shield
                          className={`h-5 w-5 ${
                            twoFAEnabled
                              ? "text-success"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {twoFAEnabled
                            ? "Two-factor authentication is enabled"
                            : "Two-factor authentication is disabled"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {twoFAEnabled
                            ? "Your account is protected with 2FA."
                            : "Enable 2FA for enhanced account security."}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={twoFAEnabled ? "outline" : "default"}
                      onClick={() => setTwoFAEnabled(!twoFAEnabled)}
                    >
                      {twoFAEnabled ? "Disable 2FA" : "Enable 2FA"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Active Sessions</CardTitle>
                  <CardDescription>
                    Manage devices that are currently signed in to your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sessions.map((session, i) => (
                      <div
                        key={session.id}
                        className={`flex items-center justify-between py-3 ${
                          i < sessions.length - 1
                            ? "border-b border-border"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {session.device.includes("iPhone") ? (
                            <Smartphone className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Laptop className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">
                                {session.device}
                              </p>
                              {session.current && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  Current
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {session.browser} &middot; {session.ip} &middot;{" "}
                              {session.location}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Last active: {session.lastActive}
                            </p>
                          </div>
                        </div>
                        {!session.current && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
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
                      value={whitelistedIP}
                      onChange={(e) => setWhitelistedIP(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addIP();
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={addIP}
                      className="shrink-0"
                    >
                      Add IP
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {whitelistedIPs.map((ip) => (
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
                    ))}
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
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Workspace
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Dialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
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
                        <span className="font-bold text-foreground">
                          DELETE
                        </span>{" "}
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
                      disabled={deleteConfirm !== "DELETE"}
                      onClick={() => {
                        setShowDeleteDialog(false);
                        setDeleteConfirm("");
                      }}
                    >
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
