import { supabase } from "@/integrations/supabase/client";
import { saveCard, revealCardSecret } from "@/lib/vault.functions";
import type { Card, CardStatus } from "@/lib/types";

export interface CardInput {
  id: string | null;
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
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Card[];
  },

  async save(input: CardInput) {
    return saveCard({ data: input });
  },

  async revealSecrets(id: string) {
    return revealCardSecret({ data: { id } });
  },

  async setStatus(id: string, status: CardStatus) {
    const { error } = await supabase.from("cards").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
  },

  /** A card is never reused after a successful payment. */
  async consume(id: string) {
    return this.setStatus(id, "Consumed");
  },

  async remove(id: string) {
    const { error } = await supabase.from("cards").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};

export function isCardUsable(card: Card): boolean {
  if (card.status !== "Available") return false;
  if (card.expires_at && new Date(card.expires_at).getTime() < Date.now()) return false;
  return true;
}

export function maskCard(card: Card): string {
  return card.card_last4 ? `•••• •••• •••• ${card.card_last4}` : "•••• ••••";
}
