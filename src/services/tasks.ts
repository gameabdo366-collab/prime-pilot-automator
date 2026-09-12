import type { Task, TaskPriority, TaskStatus } from "@/lib/types";
import { newId, nowIso, repository } from "./store";
import { logsService } from "./logs";

const repo = repository<Task>("tasks");

export interface TaskInput {
  account_id: string | null;
  card_id: string | null;
  workflow: string;
  priority: TaskPriority;
  notes: string;
}

export const tasksService = {
  async list(): Promise<Task[]> {
    const rows = await repo.list();
    return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async create(input: TaskInput): Promise<Task> {
    const task = await repo.insert({
      id: newId(),
      account_id: input.account_id,
      card_id: input.card_id,
      workflow: input.workflow,
      status: "Pending" as TaskStatus,
      progress: 0,
      priority: input.priority,
      notes: input.notes.trim(),
      created_at: nowIso(),
      started_at: null,
      finished_at: null,
    });
    await logsService.add({
      task_id: task.id,
      level: "info",
      message: `Task queued for ${task.workflow} with ${task.priority} priority.`,
    });
    return task;
  },

  async setStatus(id: string, status: TaskStatus) {
    const patch: Partial<Task> = { status };
    if (status === "Running") patch.started_at = nowIso();
    if (status === "Completed" || status === "Failed" || status === "Cancelled") {
      patch.finished_at = nowIso();
    }
    if (status === "Completed") patch.progress = 100;
    const task = await repo.update(id, patch);
    await logsService.add({ task_id: id, level: "info", message: `Task marked ${status}.` });
    return task;
  },

  async remove(id: string) {
    return repo.remove(id);
  },

  async counts() {
    const rows = await this.list();
    const by = (status: TaskStatus) => rows.filter((task) => task.status === status).length;
    return {
      total: rows.length,
      pending: by("Pending"),
      running: by("Running"),
      paused: by("Paused"),
      completed: by("Completed"),
      failed: by("Failed"),
      cancelled: by("Cancelled"),
    };
  },
};
