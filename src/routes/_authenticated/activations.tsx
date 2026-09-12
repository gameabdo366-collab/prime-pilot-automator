import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  Ban,
  Copy,
  Images,
  KeyRound,
  Loader2,
  ScrollText,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { activationsService } from "@/services/activations";
import { cardsService, isCardUsable, maskCard } from "@/services/cards";
import { tasksService } from "@/services/tasks";
import { logsService } from "@/services/logs";
import { screenshotsService } from "@/services/screenshots";
import { WORKFLOWS, workflowName, planLabel } from "@/lib/workflows";
import { formatDate, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/activations")({
  head: () => ({
    meta: [
      { title: "Activation Codes — Atlas Runner" },
      {
        name: "description",
        content: "Mint activation codes from private cards and follow every redemption.",
      },
      { property: "og:title", content: "Activation Codes — Atlas Runner" },
      {
        property: "og:description",
        content: "Mint activation codes from private cards and follow every redemption.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ActivationsPage,
});

function ActivationsPage() {
  const queryClient = useQueryClient();
  const codes = useQuery({ queryKey: ["activations"], queryFn: () => activationsService.list() });
  const cards = useQuery({ queryKey: ["cards"], queryFn: () => cardsService.list() });
  const tasks = useQuery({ queryKey: ["tasks"], queryFn: () => tasksService.list() });
  const logs = useQuery({ queryKey: ["logs", "all"], queryFn: () => logsService.list(300) });
  const shots = useQuery({ queryKey: ["screenshots"], queryFn: () => screenshotsService.list() });

  const [driver, setDriver] = useState(WORKFLOWS[0]!.key);
  const [cardId, setCardId] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const linkedCardIds = new Set((codes.data ?? []).map((row) => row.card_id));
  const freeCards = (cards.data ?? []).filter(
    (card) => isCardUsable(card) && !linkedCardIds.has(card.id),
  );

  async function generate() {
    if (!cardId) {
      toast.error("Pick a card to back the code.");
      return;
    }
    setBusy(true);
    try {
      const result = await activationsService.generate({ card_id: cardId, driver });
      await navigator.clipboard?.writeText(result.code).catch(() => undefined);
      toast.success(`Code ${result.code} created and copied.`);
      setCardId("");
      queryClient.invalidateQueries({ queryKey: ["activations"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create the code.");
    } finally {
      setBusy(false);
    }
  }

  async function cancel(id: string) {
    try {
      await activationsService.cancel(id);
      toast.success("Code cancelled.");
      queryClient.invalidateQueries({ queryKey: ["activations"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not cancel the code.");
    }
  }

  return (
    <>
      <PageHeader
        title="Activation Codes"
        description="Each code is backed by one private card. Customers only ever see the code."
        actions={
          <a
            href="/activate"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Open activation portal
          </a>
        }
      />

      <div className="panel animate-rise mb-6 p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4 text-primary" />
          Generate a code
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Driver</Label>
            <Select value={driver} onValueChange={setDriver}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORKFLOWS.map((item) => (
                  <SelectItem key={item.key} value={item.key}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Card (private)</Label>
            <Select value={cardId} onValueChange={setCardId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an unused card" />
              </SelectTrigger>
              <SelectContent>
                {freeCards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.alias} — {maskCard(card)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={generate} disabled={busy} className="w-full">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
              Generate code
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {freeCards.length} card{freeCards.length === 1 ? "" : "s"} available. A card can back only
          one code, and is consumed for good once its activation succeeds.
        </p>
      </div>

      {(codes.data ?? []).length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="No activation codes yet"
          description="Add a prepaid card in the Vault, then generate a code and share only that code with your customer."
        />
      ) : (
        <div className="space-y-3">
          {(codes.data ?? []).map((row) => {
            const card = (cards.data ?? []).find((item) => item.id === row.card_id);
            const task = (tasks.data ?? []).find((item) => item.id === row.task_id);
            const rowLogs = (logs.data ?? []).filter((entry) => entry.task_id === row.task_id);
            const rowShots = (shots.data ?? []).filter((entry) => entry.task_id === row.task_id);
            const expanded = open === row.id;

            return (
              <article key={row.id} className="panel animate-rise p-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm tracking-wider">{row.code}</span>
                    <button
                      type="button"
                      aria-label="Copy code"
                      onClick={() => {
                        void navigator.clipboard?.writeText(row.code);
                        toast.success("Code copied.");
                      }}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                  <StatusPill status={row.status} />
                  <span className="text-xs text-muted-foreground">{planLabel(row.driver)}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpen(expanded ? null : row.id)}
                    >
                      {expanded ? "Hide details" : "Details"}
                    </Button>
                    {row.status === "Unused" || row.status === "Reserved" ? (
                      <Button variant="ghost" size="sm" onClick={() => cancel(row.id)}>
                        <Ban className="size-3.5" />
                      </Button>
                    ) : null}
                  </div>
                </div>

                <dl className="mt-4 grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Linked card">
                    {card ? `${card.alias} — ${maskCard(card)}` : "—"}
                  </Field>
                  <Field label="Customer email">{row.customer_email || "—"}</Field>
                  <Field label="Task">
                    {task ? `${workflowName(task.workflow)} · ${task.status}` : "Not started"}
                  </Field>
                  <Field label="Execution time">
                    {task?.started_at ? formatDateTime(task.started_at) : "—"}
                  </Field>
                  <Field label="Renewal date">
                    {row.renewal_date ? formatDate(row.renewal_date) : "—"}
                  </Field>
                  <Field label="Activated">
                    {row.activated_at ? formatDateTime(row.activated_at) : "—"}
                  </Field>
                  <Field label="Created">{formatDateTime(row.created_at)}</Field>
                  <Field label="Code expires">
                    {row.expires_at ? formatDateTime(row.expires_at) : "—"}
                  </Field>
                </dl>

                {expanded ? (
                  <div className="mt-5 grid gap-5 border-t border-border pt-5 lg:grid-cols-2">
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold">
                        <ScrollText className="size-3.5 text-primary" />
                        Logs
                      </h3>
                      {rowLogs.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Nothing logged yet.</p>
                      ) : (
                        <ul className="space-y-2">
                          {rowLogs.map((entry) => (
                            <li key={entry.id} className="text-xs">
                              <span className="font-mono uppercase text-muted-foreground">
                                {entry.level}
                              </span>{" "}
                              <span className="text-muted-foreground">
                                {formatDateTime(entry.created_at)}
                              </span>
                              <p className="text-foreground/90">{entry.message}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold">
                        <Images className="size-3.5 text-primary" />
                        Screenshots
                      </h3>
                      {rowShots.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No captures yet.</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {rowShots.map((shot) => (
                            <img
                              key={shot.id}
                              src={shot.image}
                              alt={shot.step || "Activation step capture"}
                              loading="lazy"
                              className="aspect-video w-full rounded-lg border border-border object-cover"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-foreground/90">{children}</dd>
    </div>
  );
}
