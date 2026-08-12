import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
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
  ShieldCheck,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const PALETTE_EVENT = "agentmax:open-palette";

export function openCommandPalette() {
  window.dispatchEvent(new Event(PALETTE_EVENT));
}

const commands: { group: string; label: string; path: string; icon: React.ElementType }[] = [
  { group: "Overview", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { group: "AI Tools", label: "Agents", path: "/agents", icon: Bot },
  { group: "AI Tools", label: "Knowledge Base", path: "/knowledge", icon: Database },
  { group: "AI Tools", label: "Training", path: "/training", icon: GraduationCap },
  { group: "AI Tools", label: "Prompt Studio", path: "/prompts", icon: FileCode2 },
  { group: "Publish", label: "Deployment", path: "/deployment", icon: Rocket },
  { group: "Publish", label: "Embed Widget", path: "/embed", icon: Code2 },
  { group: "Monitor", label: "Conversations", path: "/conversations", icon: MessageSquare },
  { group: "Monitor", label: "Analytics", path: "/analytics", icon: BarChart3 },
  { group: "Account", label: "API Keys", path: "/api-keys", icon: Key },
  { group: "Account", label: "Billing", path: "/billing", icon: CreditCard },
  { group: "Account", label: "Settings", path: "/settings", icon: Settings },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    const onOpenEvent = () => setOpen(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(PALETTE_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(PALETTE_EVENT, onOpenEvent);
    };
  }, []);

  const run = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-0 p-0 max-w-lg overflow-hidden">
        <Command className="rounded-2xl bg-background text-popover-foreground" shouldFilter>
          <div className="flex items-center border-b border-border px-3">
            <Command.Input
              autoFocus
              placeholder="Search pages, actions..."
              className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
            {["Overview", "AI Tools", "Publish", "Monitor", "Account"].map((group) => {
              const items = commands.filter((c) => c.group === group);
              if (items.length === 0) return null;
              return (
                <Command.Group
                  key={group}
                  heading={
                    <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {group}
                    </span>
                  }
                >
                  {items.map((item) => (
                    <Command.Item
                      key={item.path}
                      value={item.label}
                      onSelect={() => run(item.path)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm cursor-pointer select-none",
                        "data-[selected=true]:bg-muted"
                      )}
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      {item.label}
                    </Command.Item>
                  ))}
                </Command.Group>
              );
            })}
            <Command.Separator className="my-1 h-px bg-border" />
            <div className="flex items-center justify-between px-2 py-1.5 text-[10px] text-muted-foreground/70">
              <span>
                <ShieldCheck className="inline h-3 w-3 mr-1" />
                AgentMax navigation
              </span>
              <span>
                <kbd className="rounded bg-muted px-1">Esc</kbd> to close
              </span>
            </div>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
