import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Workflow,
  ListChecks,
  ScrollText,
  Images,
  KeyRound,
  Settings as SettingsIcon,
  Zap,
  CircleDot,
} from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/accounts", label: "Accounts", icon: Users },
  { to: "/admin/cards", label: "Cards", icon: CreditCard },
  { to: "/admin/activations", label: "Activation Codes", icon: KeyRound },
  { to: "/admin/workflows", label: "Workflows", icon: Workflow },
  { to: "/admin/tasks", label: "Tasks", icon: ListChecks },
  { to: "/admin/logs", label: "Logs", icon: ScrollText },
  { to: "/admin/screenshots", label: "Screenshots", icon: Images },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary glow-ring">
            <Zap className="size-4" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Atlas Runner</p>
            <p className="text-xs text-muted-foreground">Admin portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/admin" }}
              className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/75 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{
                className:
                  "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-[inset_0_0_0_1px_var(--color-sidebar-border)]",
              }}
            >
              <Icon className="size-4 shrink-0 transition-transform group-hover:scale-110" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="m-3 rounded-xl border border-sidebar-border bg-surface/60 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CircleDot className="size-3.5 text-warning" />
            Runner offline
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground/80">
            Automation engine not installed yet.
          </p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-2 overflow-x-auto border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/admin" }}
              className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs text-muted-foreground"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
            >
              <Icon className="size-3.5" />
              {label}
            </Link>
          ))}
        </header>
        <main className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
