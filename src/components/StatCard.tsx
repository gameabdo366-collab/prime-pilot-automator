import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  index = 0,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  index?: number;
}) {
  return (
    <div
      className="animate-rise panel sheen relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:glow-ring"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-4 font-mono text-3xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
