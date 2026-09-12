import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Play, Save, Workflow as WorkflowIcon } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { accountsService } from "@/services/accounts";
import { cardsService, isCardUsable, maskCard } from "@/services/cards";
import { tasksService } from "@/services/tasks";
import { WORKFLOWS, getWorkflow, workflowName } from "@/lib/workflows";
import type { TaskPriority } from "@/lib/types";
import { relativeTime } from "@/lib/format";

const PRIORITIES: TaskPriority[] = ["Low", "Normal", "High", "Urgent"];

export const Route = createFileRoute("/_authenticated/admin/workflows")({
  head: () => ({
    meta: [
      { title: "Workflows — Atlas Runner" },
      {
        name: "description",
        content: "Queue an automation task by picking an account, a card and a workflow.",
      },
      { property: "og:title", content: "Workflows — Atlas Runner" },
      {
        property: "og:description",
        content: "Queue an automation task by picking an account, a card and a workflow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkflowsPage,
});

function WorkflowsPage() {
  const queryClient = useQueryClient();
  const accounts = useQuery({ queryKey: ["accounts"], queryFn: () => accountsService.list() });
  const cards = useQuery({ queryKey: ["cards"], queryFn: () => cardsService.list() });
  const tasks = useQuery({ queryKey: ["tasks"], queryFn: () => tasksService.list() });

  const [workflow, setWorkflow] = useState(WORKFLOWS[0]!.key);
  const [accountId, setAccountId] = useState("");
  const [cardId, setCardId] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Normal");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const definition = getWorkflow(workflow);
  const usableCards = (cards.data ?? []).filter(isCardUsable);

  async function queueTask() {
    if (!accountId) {
      toast.error("Pick an account first.");
      return;
    }
    if (definition?.requiresCard && !cardId) {
      toast.error("This workflow needs a payment card.");
      return;
    }
    setBusy(true);
    try {
      await tasksService.create({
        account_id: accountId,
        card_id: cardId || null,
        workflow,
        priority,
        notes,
      });
      toast.success("Task queued.");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not queue the task.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Workflows"
        description="Build a task now; it waits in the queue until the automation engine is installed."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel animate-rise space-y-5 p-6 lg:col-span-2">
          <div className="space-y-2">
            <Label>Workflow</Label>
            <Select value={workflow} onValueChange={setWorkflow}>
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
            {definition ? (
              <p className="text-xs text-muted-foreground">{definition.description}</p>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Account</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {(accounts.data ?? []).map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Card</Label>
              <Select value={cardId} onValueChange={setCardId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      definition?.requiresCard ? "Select a card" : "Not needed for this workflow"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {usableCards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.alias} — {maskCard(card)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only cards marked Available and still in date can be picked.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-notes">Notes</Label>
            <Textarea
              id="task-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
            <Button onClick={queueTask} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Queue task
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.info("Automation engine is not installed yet.")}
            >
              <Play className="size-4" />
              Run now
            </Button>
            <span className="text-xs text-muted-foreground">
              Automation engine is not installed yet.
            </span>
          </div>
        </div>

        <div className="panel sheen animate-rise p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <WorkflowIcon className="size-4 text-primary" />
            Steps in this workflow
          </h2>
          <ol className="mt-4 space-y-3">
            {(definition?.steps ?? []).map((step, index) => (
              <li key={step} className="flex gap-3 text-sm">
                <span className="grid size-5 shrink-0 place-items-center rounded-md border border-border bg-surface-raised font-mono text-[10px] text-muted-foreground">
                  {index + 1}
                </span>
                <span className="text-foreground/90">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="panel animate-rise mt-6 flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <h2 className="text-sm font-semibold">Queue</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {(tasks.data ?? []).length} task(s) waiting or finished.
          </p>
        </div>
        <Link
          to="/admin/tasks"
          className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Open Tasks
        </Link>
      </div>
    </>
  );
}
