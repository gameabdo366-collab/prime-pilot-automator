import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  Available: "bg-success/12 text-success border-success/25",
  Active: "bg-success/12 text-success border-success/25",
  Completed: "bg-success/12 text-success border-success/25",
  Running: "bg-info/12 text-info border-info/25",
  Pending: "bg-muted text-muted-foreground border-border",
  Unknown: "bg-muted text-muted-foreground border-border",
  Inactive: "bg-muted text-muted-foreground border-border",
  Paused: "bg-warning/12 text-warning border-warning/25",
  Expired: "bg-warning/12 text-warning border-warning/25",
  Consumed: "bg-primary/12 text-primary border-primary/25",
  Unused: "bg-primary/12 text-primary border-primary/25",
  Reserved: "bg-info/12 text-info border-info/25",
  Activated: "bg-success/12 text-success border-success/25",
  Failed: "bg-destructive/12 text-destructive border-destructive/25",
  Cancelled: "bg-destructive/12 text-destructive border-destructive/25",
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONES[status] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}
