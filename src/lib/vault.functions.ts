import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Vault write/reveal API.
 *
 * Secrets are encrypted server-side before they reach the database, and only
 * decrypted when the signed-in owner asks for a single value. The future
 * automation runner will consume these same functions.
 */

const accountSchema = z.object({
  id: z.string().uuid().nullable(),
  email: z.string().trim().min(3),
  password: z.string(),
  notes: z.string(),
  status: z.enum(["Active", "Inactive", "Expired", "Unknown"]),
  prime_expiration: z.string().nullable(),
});

const cardSchema = z.object({
  id: z.string().uuid().nullable(),
  alias: z.string().trim().min(1),
  card_number: z.string(),
  expiry: z.string(),
  cvv: z.string(),
  expires_at: z.string().nullable(),
  notes: z.string(),
  status: z.enum(["Available", "Running", "Consumed", "Expired", "Failed"]),
});

export const saveAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => accountSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { encryptValue } = await import("./vault.server");
    const row: Record<string, unknown> = {
      email: data.email,
      notes: data.notes,
      status: data.status,
      prime_expiration: data.prime_expiration,
    };
    if (data.password) row["password_encrypted"] = await encryptValue(data.password);

    if (data.id) {
      const { error } = await context.supabase.from("accounts").update(row as never).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }

    row["user_id"] = context.userId;
    const { data: inserted, error } = await context.supabase
      .from("accounts")
      .insert(row as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const saveCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => cardSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { encryptValue } = await import("./vault.server");
    const digits = data.card_number.replace(/\D/g, "");
    const row: Record<string, unknown> = {
      alias: data.alias,
      expiry: data.expiry,
      expires_at: data.expires_at,
      notes: data.notes,
      status: data.status,
    };
    if (digits) {
      row["card_number_encrypted"] = await encryptValue(digits);
      row["card_last4"] = digits.slice(-4);
    }
    if (data.cvv) row["cvv_encrypted"] = await encryptValue(data.cvv);

    if (data.id) {
      const { error } = await context.supabase.from("cards").update(row as never).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }

    row["user_id"] = context.userId;
    const { data: inserted, error } = await context.supabase
      .from("cards")
      .insert(row as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const revealAccountSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { decryptValue } = await import("./vault.server");
    const { data: row, error } = await context.supabase
      .from("accounts")
      .select("password_encrypted")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return { password: await decryptValue(row.password_encrypted ?? "") };
  });

export const revealCardSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { decryptValue } = await import("./vault.server");
    const { data: row, error } = await context.supabase
      .from("cards")
      .select("card_number_encrypted, cvv_encrypted")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return {
      card_number: await decryptValue(row.card_number_encrypted ?? ""),
      cvv: await decryptValue(row.cvv_encrypted ?? ""),
    };
  });
