import { useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Save,
  Loader2,
  Shield,
  Key,
  Mail,
  Bell,
  Laptop,
  Smartphone,
  Globe,
  Check,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const [saving, setSaving] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState({
    marketing: true,
    product: true,
    security: true,
    weekly: false,
    monthly: true,
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  const sessions = [
    {
      id: "1",
      device: 'MacBook Pro 16"',
      browser: "Chrome 120.0",
      os: "macOS Sonoma",
      ip: "192.168.1.42",
      location: "San Francisco, CA, US",
      lastActive: "Active now",
      current: true,
    },
    {
      id: "2",
      device: "iPhone 15 Pro",
      browser: "Safari 17.2",
      os: "iOS 17.2",
      ip: "192.168.1.100",
      location: "San Francisco, CA, US",
      lastActive: "3 hours ago",
      current: false,
    },
    {
      id: "3",
      device: "Windows Desktop",
      browser: "Firefox 121.0",
      os: "Windows 11",
      ip: "10.0.0.55",
      location: "New York, NY, US",
      lastActive: "2 days ago",
      current: false,
    },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal information and account security.
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile Picture</CardTitle>
            <CardDescription>
              Your profile photo will be visible across the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-gradient-primary text-white text-2xl font-bold">
                  SC
                </AvatarFallback>
              </Avatar>
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <Camera className="h-4 w-4" /> Upload new photo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  Remove photo
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or GIF. Max 2MB. Recommended 400x400px.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input defaultValue="Sarah Chen" />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="flex">
                  <Input defaultValue="sarah@agentmax.ai" type="email" />
                  <Badge
                    variant="secondary"
                    className="ml-2 shrink-0 bg-success/10 text-success flex items-center gap-1 self-center"
                  >
                    <Check className="h-3 w-3" />
                    Verified
                  </Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <Input defaultValue="AgentMax Inc." />
              </div>
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input defaultValue="Engineering Lead" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" placeholder="Enter current password" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" placeholder="Confirm new password" />
              </div>
            </div>
            <Button className="gap-2">
              <Key className="h-4 w-4" />
              Update Password
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
                      twoFAEnabled ? "text-success" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {twoFAEnabled
                      ? "Two-factor authentication is enabled"
                      : "Two-factor authentication is not set up"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {twoFAEnabled
                      ? "Your account is protected with an authenticator app."
                      : "Secure your account by enabling 2FA via an authenticator app."}
                  </p>
                </div>
              </div>
              <Button
                variant={twoFAEnabled ? "outline" : "default"}
                size="sm"
                onClick={() => setTwoFAEnabled(!twoFAEnabled)}
              >
                {twoFAEnabled ? "Disable" : "Enable 2FA"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Sessions</CardTitle>
            <CardDescription>
              Manage devices signed in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.map((session, i) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between py-3 ${
                    i < sessions.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {session.device.includes("iPhone") ? (
                      <Smartphone className="h-5 w-5 text-muted-foreground shrink-0" />
                    ) : (
                      <Laptop className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{session.device}</p>
                        {session.current && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-success/10 text-success"
                          >
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {session.browser} &middot; {session.os}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted-foreground">
                          IP: {session.ip}
                        </p>
                        <span className="text-muted-foreground">&middot;</span>
                        <p className="text-xs text-muted-foreground">
                          {session.location}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Last active: {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive shrink-0"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose which email notifications you'd like to receive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {[
              {
                key: "marketing" as const,
                label: "Product Updates",
                description: "New features, improvements, and platform updates",
                icon: Bell,
              },
              {
                key: "product" as const,
                label: "Security Alerts",
                description:
                  "Important security notifications and login alerts",
                icon: Shield,
              },
              {
                key: "security" as const,
                label: "Account Activity",
                description: "Changes to your account settings and profile",
                icon: Key,
              },
              {
                key: "weekly" as const,
                label: "Weekly Digest",
                description:
                  "Weekly summary of your agents' performance and usage",
                icon: Mail,
              },
              {
                key: "monthly" as const,
                label: "Monthly Report",
                description: "Monthly billing and analytics report",
                icon: Globe,
              },
            ].map((item, i, arr) => (
              <div
                key={item.key}
                className={`flex items-center justify-between py-4 ${
                  i < arr.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={emailNotifications[item.key]}
                  onCheckedChange={(checked) =>
                    setEmailNotifications((prev) => ({
                      ...prev,
                      [item.key]: checked,
                    }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
