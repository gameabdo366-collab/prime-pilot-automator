import type { Card, CardStatus } from "@/lib/types";
import { sealSecret } from "@/lib/secret";
import { newId, nowIso, repository } from "./store";

const repo = repository<Card>("cards");

export interface CardInput {
  alias: string;
  card_number: string;
  expiry: string;
  cvv: string;
  expires_at: string | null;
  status: CardStatus;
  notes: string;
}

export const cardsService = {
  async list(): Promise<Card[]> {
    const rows = await repo.list();
    const stamp = Date.now();
    // Temporary virtual cards age out on their own.
    const aged = rows.map((card) =>
      card.status === "Available" &&
      card.expires_at &&
      new Date(card.expires_at).getTime() < stamp
        ? { ...card, status: "Expired" as CardStatus }
        : card,
    );
    if (aged.some((card, i) => card.status !== rows[i]!.status)) await repo.replaceAll(aged);
    return aged.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async available(): Promise<Card[]> {
    return (await this.list()).filter((card) => card.status === "Available");
  },

  async create(input: CardInput): Promise<Card> {
    const stamp = nowIso();
    return repo.insert({
      id: newId(),
      alias: input.alias.trim(),
      card_number: sealSecret(input.card_number.replace(/\s+/g, "")),
      expiry: input.expiry.trim(),
      cvv: sealSecret(input.cvv.trim()),
      expires_at: input.expires_at,
      notes: input.notes.trim(),
      status: input.status,
      created_at: stamp,
      updated_at: stamp,
    });
  },

  async update(id: string, input: CardInput) {
    const patch: Partial<Card> = {
      alias: input.alias.trim(),
      expiry: input.expiry.trim(),
      expires_at: input.expires_at,
      notes: input.notes.trim(),
      status: input.status,
      updated_at: nowIso(),
    };
    if (input.card_number) patch.card_number = sealSecret(input.card_number.replace(/\s+/g, ""));
    if (input.cvv) patch.cvv = sealSecret(input.cvv.trim());
    return repo.update(id, patch);
  },

  async setStatus(id: string, status: CardStatus) {
    return repo.update(id, { status, updated_at: nowIso() });
  },

  /** A card is never reused after a successful payment. */
  async consume(id: string) {
    return this.setStatus(id, "Consumed");
  },

  async remove(id: string) {
    return repo.remove(id);
  },
};
