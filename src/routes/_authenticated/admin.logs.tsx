import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ScrollText, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { logsService } from "@/services/logs";
import type { LogLevel } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

const LEVELS: (LogLevel | "all")[] = ["all", "debug", "info", "warn", "error"];

const LEVEL_TONE: Record<LogLevel, string> = {
  debug: "text-muted-foreground",
  info: "text-info",
  warn: "text-warning",
  error: "text-destructive",
};

export const Route = createFileRoute("/_authenticated/admin/logs")({
  head: () => ({
    meta: [
      { title: "Logs — Atlas Runner" },
      { name: "description", content: "Timeline of every recorded automation event." },
      { property: "og:title", content: "Logs — Atlas Runner" },
      { property: "og:description", content: "Timeline of every recorded automation event." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LogsPage,
});

function LogsPage() {
  const { data } = useQuery({ queryKey: ["logs", "all"], queryFn: () => logsService.list(300) });
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<LogLevel | "all">("all");

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (data ?? []).filter(
      (entry) =>
        (level === "all" || entry.level === level) &&
        (!needle || entry.message.toLowerCase().includes(needle)),
    );
  }, [data, query, level]);

  return (
    <>
      <PageHeader title="Logs" description="Every step the platform records, newest first." />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages…"
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
          {LEVELS.map((item) => (
            <Button
              key={item}
              size="sm"
              variant={level === item ? "secondary" : "ghost"}
              onClick={() => setLevel(item)}
              className="h-7 px-3 text-xs capitalize"
            >
              {item}
            </Button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="Nothing logged yet"
          description="Once tasks start running, every step lands here with its exact time."
        />
      ) : (
        <div className="panel p-6">
          <ol className="relative space-y-6 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
            {rows.map((entry) => (
              <li key={entry.id} className="relative animate-rise pl-8">
                <span className="absolute left-0 top-1.5 grid size-4 place-items-center rounded-full border border-border bg-background">
                  <span className={`size-1.5 rounded-full bg-current ${LEVEL_TONE[entry.level]}`} />
                </span>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span
                    className={`font-mono text-[11px] uppercase tracking-wider ${LEVEL_TONE[entry.level]}`}
                  >
                    {entry.level}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(entry.created_at)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground/90">{entry.message}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  );
}
