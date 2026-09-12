import { supabase } from "@/integrations/supabase/client";
import type { AppSettings } from "@/lib/types";

export const DEFAULT_SETTINGS: AppSettings = {
  headless_mode: true,
  visible_browser: false,
  timeout_seconds: 60,
  retries: 2,
  runner_url: "",
  runner_token: "",
};

export const settingsService = {
  async get(): Promise<AppSettings> {
    const { data, error } = await supabase.from("settings").select("*").maybeSingle();
    if (error) throw new Error(error.message);
    return { ...DEFAULT_SETTINGS, ...(data ?? {}) } as AppSettings;
  },

  async save(settings: AppSettings): Promise<AppSettings> {
    const { data: session } = await supabase.auth.getUser();
    const userId = session.user?.id;
    if (!userId) throw new Error("Not signed in.");
    const { error } = await supabase
      .from("settings")
      .upsert({ user_id: userId, ...settings }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return settings;
  },
};
