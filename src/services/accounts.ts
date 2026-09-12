import { supabase } from "@/integrations/supabase/client";
import { saveAccount, revealAccountSecret } from "@/lib/vault.functions";
import type { Account, AccountStatus } from "@/lib/types";

export interface AccountInput {
  id: string | null;
  email: string;
  password: string;
  status: AccountStatus;
  prime_expiration: string | null;
  notes: string;
}

export const accountsService = {
  async list(): Promise<Account[]> {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Account[];
  },

  async save(input: AccountInput) {
    return saveAccount({ data: input });
  },

  async revealPassword(id: string) {
    const result = await revealAccountSecret({ data: { id } });
    return result.password;
  },

  async remove(id: string) {
    const { error } = await supabase.from("accounts").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};
