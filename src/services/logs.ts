import { supabase } from "@/integrations/supabase/client";
import type { LogEntry, LogLevel } from "@/lib/types";

export const logsService = {
  async list(limit = 300): Promise<LogEntry[]> {
    const { data, error } = await supabase
      .from("logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as LogEntry[];
  },

  async add(entry: { task_id: string | null; level: LogLevel; message: string }) {
    const { error } = await supabase.from("logs").insert(entry);
    if (error) throw new Error(error.message);
  },
};
