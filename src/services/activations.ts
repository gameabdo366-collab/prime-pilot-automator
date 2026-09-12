import { supabase } from "@/integrations/supabase/client";
import {
  generateActivationCode,
  cancelActivationCode,
} from "@/lib/activation.functions";
import type { ActivationCode } from "@/lib/types";

export const activationsService = {
  async list(): Promise<ActivationCode[]> {
    const { data, error } = await supabase
      .from("activation_codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as ActivationCode[];
  },

  async generate(input: {
    card_id: string;
    driver: string;
    notes?: string;
    expires_at?: string | null;
  }) {
    return generateActivationCode({
      data: {
        card_id: input.card_id,
        driver: input.driver,
        notes: input.notes ?? "",
        expires_at: input.expires_at ?? null,
      },
    });
  },

  async cancel(id: string) {
    return cancelActivationCode({ data: { id } });
  },

  async remove(id: string) {
    const { error } = await supabase.from("activation_codes").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};
