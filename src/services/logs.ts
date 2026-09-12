import type { LogEntry, LogLevel } from "@/lib/types";
import { newId, nowIso, repository } from "./store";

const repo = repository<LogEntry>("logs");

export const logsService = {
  async list(): Promise<LogEntry[]> {
    const rows = await repo.list();
    return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async add(entry: { task_id: string | null; level: LogLevel; message: string }) {
    return repo.insert({
      id: newId(),
      task_id: entry.task_id,
      level: entry.level,
      message: entry.message,
      created_at: nowIso(),
    });
  },

  async clear() {
    return repo.replaceAll([]);
  },
};
