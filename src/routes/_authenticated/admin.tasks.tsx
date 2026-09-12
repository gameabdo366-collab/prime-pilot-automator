import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { EmptyState } from "@/components/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { tasksService } from "@/services/tasks";
import { workflowName } from "@/lib/workflows";
import { formatDateTime, relativeTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Atlas Runner Admin" },
      { name: "description", content: "Every queued and finished automation task." },
      { property: "og:title", content: "Tasks — Atlas Runner Admin" },
      { property: "og:description", content: "Every queued and finished automation task." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const { data } = useQuery({ queryKey: ["tasks"], queryFn: () => tasksService.list() });
  const rows = data ?? [];

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Queued work, whether you created it here or a customer redeemed an activation code."
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Nothing queued yet"
          description="Queue a task from Workflows, or generate an activation code for a customer."
        />
      ) : (
        <div className="panel animate-rise overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workflow</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Finished</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((task) => (
                <TableRow key={task.id} className="transition-colors hover:bg-accent/40">
                  <TableCell className="font-medium">{workflowName(task.workflow)}</TableCell>
                  <TableCell>
                    <StatusPill status={task.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{task.progress}%</TableCell>
                  <TableCell className="text-muted-foreground">{task.priority}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {relativeTime(task.created_at)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(task.finished_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
