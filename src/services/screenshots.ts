import { supabase } from "@/integrations/supabase/client";
import type { Screenshot } from "@/lib/types";

export const screenshotsService = {
  async list(): Promise<Screenshot[]> {
    const { data, error } = await supabase
      .from("screenshots")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Screenshot[];
  },

  /** Signed URL for a stored capture in the private screenshots bucket. */
  async signedUrl(path: string, seconds = 3600) {
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    const { data } = await supabase.storage.from("screenshots").createSignedUrl(path, seconds);
    return data?.signedUrl ?? "";
  },

  async remove(id: string) {
    const { error } = await supabase.from("screenshots").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};
