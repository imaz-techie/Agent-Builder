import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Loader2,
  Trash2,
  ShieldCheck,
  ShieldX,
  AlertCircle,
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  useAdminUsersQuery,
} from "@/hooks/queries/useAdminQueries";
import {
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
} from "@/hooks/mutations/useAdminMutations";
import {
  PLATFORM_ROLES,
  type PlatformRole,
  type AdminUser,
} from "@/types/admin.types";

const ROLE_STYLES: Record<PlatformRole, string> = {
  ADMIN: "bg-primary/10 text-primary",
  DEVELOPER: "bg-blue-500/10 text-blue-500",
  VIEWER: "bg-muted text-muted-foreground",
  WORKSPACE_OWNER: "bg-violet-500/10 text-violet-500",
};

function getInitials(name: string) {
  return name
    .trim()
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const { data, isLoading, isError } = useAdminUsersQuery({
    search: search || undefined,
    role: roleFilter === "all" ? undefined : (roleFilter as PlatformRole),
    limit: 100,
  });

  const updateUser = useUpdateAdminUserMutation();
  const deleteUser = useDeleteAdminUserMutation();

  const changeRole = (user: AdminUser, role: PlatformRole) => {
    if (role !== user.role) {
      updateUser.mutate({ userId: user.id, dto: { role } });
    }
  };

  const toggleVerified = (user: AdminUser) => {
    updateUser.mutate({
      userId: user.id,
      dto: { isVerified: !user.isVerified },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage all platform accounts, roles, and verification status.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Users</CardTitle>
          <CardDescription>
            {data?.meta ? `${data.meta.totalItems} total users` : "Platform accounts"}
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {PLATFORM_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <p className="text-sm">Unable to load users.</p>
            </div>
          )}

          {data && data.users.length === 0 && (
            <p className="text-sm text-muted-foreground py-12 text-center">
              No users found.
            </p>
          )}

          {data && data.users.length > 0 && (
            <div className="space-y-2">
              {data.users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${ROLE_STYLES[user.role] ?? ""}`}
                      >
                        {user.role}
                      </Badge>
                      {user.twoFactorEnabled && (
                        <Badge variant="secondary" className="text-[10px] bg-success/10 text-success">
                          2FA
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleVerified(user)}
                      disabled={updateUser.isPending}
                      className={user.isVerified ? "text-success" : ""}
                    >
                      {user.isVerified ? (
                        <ShieldCheck className="h-4 w-4 mr-1.5" />
                      ) : (
                        <ShieldX className="h-4 w-4 mr-1.5" />
                      )}
                      {user.isVerified ? "Verified" : "Unverified"}
                    </Button>
                    <Select
                      value={user.role}
                      onValueChange={(value) => changeRole(user, value as PlatformRole)}
                    >
                      <SelectTrigger className="w-44 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORM_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete User</DialogTitle>
            <DialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.name}
              </span>{" "}
              ({deleteTarget?.email}) and all associated data. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteUser.isPending}
              onClick={() => {
                if (deleteTarget) {
                  deleteUser.mutate(deleteTarget.id, {
                    onSuccess: () => setDeleteTarget(null),
                  });
                }
              }}
            >
              {deleteUser.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
