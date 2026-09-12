import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  CreditCard,
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  Activity,
  Server,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusPill } from "@/components/StatusPill";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { accountsService } from "@/services/accounts";
import { cardsService } from "@/services/cards";
import { tasksService, countByStatus } from "@/services/tasks";
import { logsService } from "@/services/logs";
import { workflowName } from "@/lib/workflows";
import { relativeTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Atlas Runner" },
      {
        name: "description",
        content: "Overview of accounts, cards and automation tasks in your private console.",
      },
      { property: "og:title", content: "Dashboard — Atlas Runner" },
      {
        property: "og:description",
        content: "Overview of accounts, cards and automation tasks in your private console.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const accounts = useQuery({ queryKey: ["accounts"], queryFn: () => accountsService.list() });
  const cards = useQuery({ queryKey: ["cards"], queryFn: () => cardsService.list() });
  const tasks = useQuery({ queryKey: ["tasks"], queryFn: () => tasksService.list() });
  const logs = useQuery({ queryKey: ["logs"], queryFn: () => logsService.list(8) });

  const counts = countByStatus(tasks.data ?? []);
  const usableCards = (cards.data ?? []).filter((card) => card.status === "Available").length;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Everything queued, stored and recorded in your private automation console."
        actions={
          <Button asChild>
            <Link to="/workflows">
              New task
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          index={0}
          label="Accounts"
          value={accounts.data?.length ?? 0}
          hint="Stored in the vault"
          icon={Users}
        />
        <StatCard
          index={1}
          label="Cards"
          value={cards.data?.length ?? 0}
          hint={`${usableCards} available`}
          icon={CreditCard}
        />
        <StatCard index={2} label="Pending tasks" value={counts.pending} icon={Clock} />
        <StatCard index={3} label="Running tasks" value={counts.running} icon={Play} />
        <StatCard index={4} label="Completed" value={counts.completed} icon={CheckCircle2} />
        <StatCard index={5} label="Failed" value={counts.failed} icon={XCircle} />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="panel animate-rise p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="size-4 text-primary" />
              Recent activity
            </h2>
            <Link to="/logs" className="text-xs text-muted-foreground hover:text-foreground">
              View all logs
            </Link>
          </div>

          {(logs.data ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No activity yet. Queue a task to start the record.
            </p>
          ) : (
            <ul className="space-y-3">
              {(logs.data ?? []).map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="flex-1 text-foreground/90">{entry.message}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {relativeTime(entry.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel sheen animate-rise p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Server className="size-4 text-primary" />
            Runner status
          </h2>
          <div className="mt-4 flex items-center gap-2">
            <StatusPill status="Pending" />
            <span className="text-xs text-muted-foreground">Not connected</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            The automation engine is not installed yet. Tasks you create are queued and will be
            picked up once the runner is connected.
          </p>
          <Button asChild variant="secondary" className="mt-5 w-full">
            <Link to="/settings">Runner settings</Link>
          </Button>
        </div>
      </section>

      <section className="mt-6">
        <div className="panel animate-rise p-6">
          <h2 className="mb-4 text-sm font-semibold">Latest tasks</h2>
          {(tasks.data ?? []).length === 0 ? (
            <EmptyState
              icon={Play}
              title="No tasks yet"
              description="Create your first task from the Workflows page. It stays queued until the automation engine is available."
              action={
                <Button asChild>
                  <Link to="/workflows">Create task</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {(tasks.data ?? []).slice(0, 6).map((task) => (
                <li key={task.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="flex-1 text-sm font-medium">{workflowName(task.workflow)}</span>
                  <span className="text-xs text-muted-foreground">{task.priority}</span>
                  <StatusPill status={task.status} />
                  <span className="text-xs text-muted-foreground">
                    {relativeTime(task.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
