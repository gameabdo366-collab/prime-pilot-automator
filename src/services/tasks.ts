import { supabase } from "@/integrations/supabase/client";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";
import { logsService } from "./logs";

export interface TaskInput {
  account_id: string | null;
  card_id: string | null;
  workflow: string;
  priority: TaskPriority;
  notes: string;
}

export const tasksService = {
  async list(): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Task[];
  },

  async create(input: TaskInput): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        account_id: input.account_id,
        card_id: input.card_id,
        workflow: input.workflow,
        priority: input.priority,
        notes: input.notes,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    const task = data as Task;
    await logsService.add({
      task_id: task.id,
      level: "info",
      message: `Task queued — ${task.workflow} (${task.priority} priority). Waiting for the automation engine.`,
    });
    return task;
  },

  async setStatus(id: string, status: TaskStatus) {
    const patch: Record<string, unknown> = { status };
    if (status === "Running") patch["started_at"] = new Date().toISOString();
    if (status === "Completed" || status === "Failed" || status === "Cancelled") {
      patch["finished_at"] = new Date().toISOString();
    }
    if (status === "Completed") patch["progress"] = 100;
    const { error } = await supabase.from("tasks").update(patch as never).eq("id", id);
    if (error) throw new Error(error.message);
    await logsService.add({ task_id: id, level: "info", message: `Task marked ${status}.` });
  },

  async remove(id: string) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};

export function countByStatus(tasks: Task[]) {
  const by = (status: TaskStatus) => tasks.filter((task) => task.status === status).length;
  return {
    total: tasks.length,
    pending: by("Pending"),
    running: by("Running"),
    paused: by("Paused"),
    completed: by("Completed"),
    failed: by("Failed"),
    cancelled: by("Cancelled"),
  };
}
