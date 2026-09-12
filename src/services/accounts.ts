import type { Account, AccountStatus } from "@/lib/types";
import { sealSecret } from "@/lib/secret";
import { newId, nowIso, repository } from "./store";

const repo = repository<Account>("accounts");

export interface AccountInput {
  email: string;
  password: string;
  status: AccountStatus;
  prime_expiration: string | null;
  notes: string;
}

export const accountsService = {
  async list(): Promise<Account[]> {
    const rows = await repo.list();
    return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async create(input: AccountInput): Promise<Account> {
    const stamp = nowIso();
    return repo.insert({
      id: newId(),
      email: input.email.trim(),
      password: sealSecret(input.password),
      notes: input.notes.trim(),
      status: input.status,
      prime_expiration: input.prime_expiration,
      last_execution: null,
      created_at: stamp,
      updated_at: stamp,
    });
  },

  async update(id: string, input: AccountInput) {
    const patch: Partial<Account> = {
      email: input.email.trim(),
      notes: input.notes.trim(),
      status: input.status,
      prime_expiration: input.prime_expiration,
      updated_at: nowIso(),
    };
    if (input.password) patch.password = sealSecret(input.password);
    return repo.update(id, patch);
  },

  async remove(id: string) {
    return repo.remove(id);
  },

  async markExecuted(id: string) {
    return repo.update(id, { last_execution: nowIso(), updated_at: nowIso() });
  },
};
