import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Bot,
  Database,
  GraduationCap,
  FileCode2,
  Rocket,
  Code2,
  MessageSquare,
  BarChart3,
  Key,
  CreditCard,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Zap,
  Crown,
  PanelLeftClose,
  PanelLeft,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { notifications } from "@/lib/mock-data";

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 68;

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "AI Tools",
    items: [
      { label: "Agents", path: "/agents", icon: Bot, badge: "8" },
      { label: "Knowledge Base", path: "/knowledge", icon: Database },
      { label: "Training", path: "/training", icon: GraduationCap },
      { label: "Prompt Studio", path: "/prompts", icon: FileCode2 },
    ],
  },
  {
    label: "Publish",
    items: [
      { label: "Deployment", path: "/deployment", icon: Rocket },
      { label: "Embed Widget", path: "/embed", icon: Code2 },
    ],
  },
  {
    label: "Monitor",
    items: [
      {
        label: "Conversations",
        path: "/conversations",
        icon: MessageSquare,
        badge: "12",
      },
      { label: "Analytics", path: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "API Keys", path: "/api-keys", icon: Key },
      { label: "Billing", path: "/billing", icon: CreditCard },
      { label: "Settings", path: "/settings", icon: Settings },
      { label: "Help Center", path: "/help", icon: HelpCircle },
    ],
  },
];

const flatNavItems = navGroups.flatMap((g) => g.items);

function SidebarNavItem({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <NavLink
          to={item.path}
          className={({ isActive }) =>
            cn(
              "relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200 group",
              collapsed && "justify-center px-0 py-2.5",
              isActive
                ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-primary"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon
                className={cn(
                  "relative z-10 h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10 whitespace-nowrap overflow-hidden flex-1"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && item.badge && (
                <Badge
                  variant="secondary"
                  className="ml-auto h-5 px-1.5 text-[10px] font-semibold bg-primary/10 text-primary border-0 shrink-0"
                >
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </NavLink>
      </TooltipTrigger>
      {collapsed && (
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
          {item.badge && (
            <span className="ml-1.5 text-primary">({item.badge})</span>
          )}
        </TooltipContent>
      )}
    </Tooltip>
  );
}

function SidebarNavGroup({
  group,
  collapsed,
}: {
  group: NavGroup;
  collapsed: boolean;
}) {
  if (collapsed) {
    return (
      <div className="flex flex-col gap-0.5">
        {group.items.map((item) => (
          <SidebarNavItem key={item.path} item={item} collapsed={collapsed} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
        {group.label}
      </p>
      <div className="flex flex-col gap-0.5">
        {group.items.map((item) => (
          <SidebarNavItem key={item.path} item={item} collapsed={collapsed} />
        ))}
      </div>
    </div>
  );
}

function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const location = useLocation();

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -SIDEBAR_WIDTH }}
            animate={{ x: 0 }}
            exit={{ x: -SIDEBAR_WIDTH }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col lg:hidden"
          >
            <div className="flex items-center justify-between px-4 h-16 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-bold gradient-text leading-tight">
                    AgentMax
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    AI Platform
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="flex-1 px-3 py-3">
              <div className="flex flex-col gap-4">
                {navGroups.map((group) => (
                  <SidebarNavGroup
                    key={group.label}
                    group={group}
                    collapsed={false}
                  />
                ))}
              </div>
            </ScrollArea>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function TopNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center px-4 lg:px-5 gap-3">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0 h-9 w-9"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-border/50 text-muted-foreground cursor-pointer hover:bg-muted hover:border-border transition-all flex-1 max-w-xs">
        <Search className="h-4 w-4 shrink-0" />
        <span className="text-sm">Search...</span>
        <kbd className="ml-auto text-[10px] font-mono bg-background/80 border border-border/60 rounded-md px-1.5 py-0.5 text-muted-foreground/70">
          Ctrl+K
        </kbd>
      </div>

      <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
        <Search className="h-5 w-5" />
      </Button>

      <div className="ml-auto flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex gap-2 h-9 px-2.5 rounded-xl"
            >
              <div className="h-5 w-5 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium">AgentMax</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="bg-primary/10 text-primary gap-2.5">
              <div className="h-5 w-5 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              AgentMax Workspace
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2.5">
              <div className="h-5 w-5 rounded-md bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                T
              </div>
              Team Workspace
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-primary gap-2.5">
              <Zap className="h-4 w-4" />
              Create new workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-xl"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center px-1 ring-2 ring-background">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <Badge variant="secondary" className="text-[10px]">
                {unreadCount} new
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.slice(0, 5).map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className="flex flex-col items-start gap-1.5 py-2.5 px-3 cursor-pointer"
              >
                <div className="flex items-center gap-2 w-full">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full shrink-0",
                      notif.type === "error" && "bg-destructive",
                      notif.type === "warning" && "bg-warning",
                      notif.type === "success" && "bg-success",
                      notif.type === "info" && "bg-info",
                      notif.read && "bg-muted-foreground/30",
                    )}
                  />
                  <span className="text-sm font-medium truncate">
                    {notif.title}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1 pl-4">
                  {notif.message}
                </p>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center text-sm text-primary font-medium">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 rounded-xl"
        >
          {theme === "light" ? (
            <Moon className="h-[18px] w-[18px]" />
          ) : (
            <Sun className="h-[18px] w-[18px]" />
          )}
        </Button>

        <Separator
          orientation="vertical"
          className="h-6 mx-1 hidden sm:block"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 px-1.5 h-9 rounded-xl"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-[11px] font-bold">
                  SC
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium leading-tight">
                  Sarah Chen
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  Admin
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">Sarah Chen</span>
                <span className="text-xs font-normal text-muted-foreground">
                  sarah@agentmax.ai
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2.5" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2.5" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="h-4 w-4 mr-2.5" />
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => navigate("/login")}
            >
              <LogOut className="h-4 w-4 mr-2.5" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sidebarWidth = isMobile
    ? 0
    : collapsed
      ? SIDEBAR_COLLAPSED_WIDTH
      : SIDEBAR_WIDTH;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {!isMobile && (
        <motion.aside
          animate={{ width: sidebarWidth }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative flex flex-col border-r border-border bg-card/50 backdrop-blur-sm shrink-0 overflow-hidden"
        >
          {/* Logo */}
          <div
            className={cn(
              "flex items-center border-b border-border/50 shrink-0 h-14",
              collapsed ? "justify-center px-2" : "px-4 gap-3",
            )}
          >
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  <span className="text-[15px] font-bold gradient-text">
                    AgentMax
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium ml-1.5">
                    AI
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-2.5 py-3">
            <div className="flex flex-col gap-4">
              {navGroups.map((group) => (
                <SidebarNavGroup
                  key={group.label}
                  group={group}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </ScrollArea>

          {/* Upgrade Banner */}
          {!collapsed && (
            <div className="px-3 pb-2">
              <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 p-3.5">
                <div className="absolute top-0 right-0 h-16 w-16 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-primary">
                      Pro Plan
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-2.5">
                    Unlock unlimited agents and priority support
                  </p>
                  <Button
                    size="sm"
                    className="h-7 text-[11px] font-semibold w-full rounded-lg"
                  >
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* User Profile */}
          <div className="border-t border-border/50 px-2.5 py-2.5">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors hover:bg-muted/70 cursor-pointer",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs font-bold">
                        SC
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success border-2 border-card" />
                  </div>
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col overflow-hidden min-w-0 flex-1"
                      >
                        <span className="text-[13px] font-medium leading-tight whitespace-nowrap truncate">
                          Imaz
                        </span>
                        <span className="text-[11px] text-muted-foreground leading-tight whitespace-nowrap truncate">
                          Imaz@agentmax.ai
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" sideOffset={8}>
                  Imaz
                </TooltipContent>
              )}
            </Tooltip>
          </div>

          {/* Collapse Toggle */}
          <div className="border-t border-border/50 px-2.5 py-2">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size={collapsed ? "icon" : "sm"}
                  className={cn(
                    "w-full h-8 rounded-xl text-muted-foreground hover:text-foreground",
                    collapsed ? "w-9" : "justify-start gap-2 px-2.5",
                  )}
                  onClick={() => setCollapsed(!collapsed)}
                >
                  {collapsed ? (
                    <PanelLeft className="h-4 w-4" />
                  ) : (
                    <>
                      <PanelLeftClose className="h-4 w-4" />
                      <span className="text-[13px]">Collapse</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" sideOffset={8}>
                  Expand sidebar
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </motion.aside>
      )}

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0">
        <TopNavbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
