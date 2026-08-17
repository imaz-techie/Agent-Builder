import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Building2,
  ScrollText,
  ShieldAlert,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileQuery } from "@/hooks/queries/useAuthQueries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STORAGE_KEYS } from "@/constants/api.constants";

const ADMIN_NAV = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Workspaces", path: "/admin/workspaces", icon: Building2 },
  { label: "System Logs", path: "/admin/logs", icon: ScrollText },
] as const;

function getStoredRole(): string | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
    return raw ? (JSON.parse(raw) as { role?: string }).role ?? null : null;
  } catch {
    return null;
  }
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const { data: userProfile } = useProfileQuery();
  const role = userProfile?.role ?? getStoredRole();
  const isAdmin = role === "ADMIN";

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
    navigate("/login");
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-xl font-bold">Access Denied</h1>
          <p className="text-sm text-muted-foreground">
            The admin console is restricted to platform administrators. If you
            believe this is a mistake, contact the platform owner.
          </p>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <motion.aside
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative flex flex-col w-60 border-r border-border/60 glass-sidebar shrink-0"
      >
        <div className="flex items-center gap-3 border-b border-border/50 px-4 h-14 shrink-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-linear-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="whitespace-nowrap overflow-hidden">
            <span className="text-[15px] font-bold gradient-text">Admin</span>
            <span className="text-[10px] text-muted-foreground font-medium ml-1.5">
              Console
            </span>
          </div>
          <Badge variant="secondary" className="ml-auto text-[10px]">
            ADMIN
          </Badge>
        </div>

        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border/50 p-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2.5" />
            Logout
          </Button>
        </div>
      </motion.aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
