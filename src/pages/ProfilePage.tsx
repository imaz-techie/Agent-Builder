import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Save,
  Loader2,
  Key,
  Mail,
  Laptop,
  Smartphone,
  Check,
  AlertTriangle,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TwoFactorCard } from "@/components/profile/TwoFactorCard";

import { useProfileQuery, useSessionsQuery } from "@/hooks/queries/useAuthQueries";
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useRevokeSessionMutation,
} from "@/hooks/mutations/useAuthMutations";
import { STORAGE_KEYS } from "@/constants/api.constants";

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

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: userProfile } = useProfileQuery();

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setAvatarUrl(userProfile.avatarUrl || "");
    }
  }, [userProfile]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const updateProfile = useUpdateProfileMutation();
  const changePassword = useChangePasswordMutation();
  const revokeSession = useRevokeSessionMutation();
  const { data: sessions } = useSessionsQuery();

  const handleChangePassword = () => {
    setPasswordError("");
    if (!currentPassword || !newPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
          navigate("/login");
        },
      }
    );
  };

  const initials = (name || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-4xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and account security.
        </p>
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
                <AvatarImage src={userProfile?.avatarUrl || undefined} alt={name} />
                <AvatarFallback className="bg-gradient-primary text-white text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div className="space-y-2">
                  <Label>Avatar URL</Label>
                  <div className="flex gap-3">
                    <Input
                      placeholder="https://..."
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateProfile.mutate({ avatarUrl: avatarUrl || undefined })
                      }
                      disabled={updateProfile.isPending}
                    >
                      {updateProfile.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or GIF. Recommended 400x400px.
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
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      value={userProfile?.email ?? ""}
                      type="email"
                      disabled
                    />
                  </div>
                  {userProfile?.isVerified ? (
                    <Badge
                      variant="secondary"
                      className="shrink-0 bg-success/10 text-success flex items-center gap-1 self-center"
                    >
                      <Check className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="shrink-0 self-center">
                      Unverified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => updateProfile.mutate({ name })}
                disabled={!name.trim() || updateProfile.isPending}
              >
                {updateProfile.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
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
              Update your password to keep your account secure. You'll be
              signed out of all sessions after changing it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            {passwordError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                {passwordError}
              </div>
            )}
            <Button
              className="gap-2"
              onClick={handleChangePassword}
              disabled={changePassword.isPending}
            >
              {changePassword.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Key className="h-4 w-4 mr-2" />
              )}
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
            <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
            <CardDescription>
              Add an extra layer of security to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TwoFactorCard enabled={userProfile?.twoFactorEnabled ?? false} />
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
                        <Smartphone className="h-5 w-5 text-muted-foreground shrink-0" />
                      ) : (
                        <Laptop className="h-5 w-5 text-muted-foreground shrink-0" />
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
                      className="text-destructive hover:text-destructive shrink-0"
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification Preferences</CardTitle>
            <CardDescription>
              Manage your notification preferences in workspace settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Email & In-app Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Control which notifications you receive.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/settings?tab=notifications")}
              >
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
