import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getWorkflow, planLabel, customerStage } from "./workflows";

/**
 * Activation Code API.
 *
 * Two audiences, one table:
 *  - Administrator functions (auth required) mint and cancel codes against a
 *    private prepaid card.
 *  - Portal functions (public) let a customer redeem a code. They run entirely
 *    server-side with the service-role client and NEVER return card data —
 *    no number, no expiry, no CVV, not even the last four digits.
 */

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomGroup(length = 4): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

function buildCode(prefix: string): string {
  return `${prefix}-${randomGroup()}-${randomGroup()}-${randomGroup()}`;
}

const codeInput = z.object({
  code: z
    .string()
    .trim()
    .min(6)
    .max(32)
    .transform((value) => value.toUpperCase().replace(/\s+/g, "")),
});

/* ------------------------------------------------------------------ admin */

export const generateActivationCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        card_id: z.string().uuid(),
        driver: z.string().min(1),
        notes: z.string().default(""),
        expires_at: z.string().nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const workflow = getWorkflow(data.driver);
    if (!workflow) throw new Error("Unknown driver.");

    const { data: card, error: cardError } = await context.supabase
      .from("cards")
      .select("id, status, expires_at")
      .eq("id", data.card_id)
      .single();
    if (cardError) throw new Error(cardError.message);
    if (card.status !== "Available") throw new Error("This card is no longer available.");

    const { data: existing } = await context.supabase
      .from("activation_codes")
      .select("id")
      .eq("card_id", data.card_id)
      .maybeSingle();
    if (existing) throw new Error("This card already has an activation code.");

    let lastError = "Could not generate a unique code.";
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = buildCode(workflow.codePrefix);
      const { data: inserted, error } = await context.supabase
        .from("activation_codes")
        .insert({
          user_id: context.userId,
          code,
          driver: data.driver,
          card_id: data.card_id,
          notes: data.notes,
          expires_at: data.expires_at ?? card.expires_at,
        } as never)
        .select("id, code")
        .single();
      if (!error) return { id: inserted.id, code: inserted.code };
      lastError = error.message;
    }
    throw new Error(lastError);
  });

export const cancelActivationCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("activation_codes")
      .update({ status: "Cancelled" } as never)
      .eq("id", data.id)
      .in("status", ["Unused", "Reserved"]);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ----------------------------------------------------------------- portal */

type PortalRow = {
  id: string;
  user_id: string;
  code: string;
  driver: string;
  card_id: string | null;
  task_id: string | null;
  status: string;
  expires_at: string | null;
};

async function loadCode(code: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("activation_codes")
    .select("id, user_id, code, driver, card_id, task_id, status, expires_at")
    .eq("code", code)
    .maybeSingle();
  if (error) throw new Error("We could not check that code right now. Please try again.");
  return { supabaseAdmin, row: (data as PortalRow | null) ?? null };
}

function isExpired(row: PortalRow): boolean {
  return Boolean(row.expires_at && new Date(row.expires_at).getTime() < Date.now());
}

/** Step 1 — the customer types a code. Nothing about the card is returned. */
export const verifyActivationCode = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => codeInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin, row } = await loadCode(data.code);
    if (!row) return { valid: false as const, reason: "This activation code was not found." };

    if (isExpired(row) && (row.status === "Unused" || row.status === "Reserved")) {
      await supabaseAdmin
        .from("activation_codes")
        .update({ status: "Expired" } as never)
        .eq("id", row.id);
      return { valid: false as const, reason: "This activation code has expired." };
    }

    if (row.status === "Activated") {
      return { valid: false as const, reason: "This activation code has already been used." };
    }
    if (row.status === "Running") {
      return { valid: false as const, reason: "This activation code is already being processed." };
    }
    if (row.status !== "Unused" && row.status !== "Reserved") {
      return { valid: false as const, reason: "This activation code is no longer valid." };
    }

    return {
      valid: true as const,
      plan: planLabel(row.driver),
      target: getWorkflow(row.driver)?.target ?? "",
    };
  });

/** Step 2 — the customer hands over the account the subscription belongs to. */
export const beginActivation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        code: codeInput.shape.code,
        email: z.string().trim().email(),
        password: z.string().min(1),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { encryptValue } = await import("./vault.server");
    const { supabaseAdmin, row } = await loadCode(data.code);
    if (!row) throw new Error("This activation code was not found.");
    if (isExpired(row)) throw new Error("This activation code has expired.");
    if (row.status !== "Unused" && row.status !== "Reserved") {
      throw new Error("This activation code is no longer valid.");
    }

    const workflow = getWorkflow(row.driver);
    if (!workflow) throw new Error("This activation is not available right now.");

    const encryptedPassword = await encryptValue(data.password);

    // The customer's account is stored in the administrator's private vault.
    const { data: account, error: accountError } = await supabaseAdmin
      .from("accounts")
      .insert({
        user_id: row.user_id,
        email: data.email,
        password_encrypted: encryptedPassword,
        notes: `Added by activation ${row.code}.`,
      } as never)
      .select("id")
      .single();
    if (accountError) throw new Error("We could not start the activation. Please try again.");

    const { data: task, error: taskError } = await supabaseAdmin
      .from("tasks")
      .insert({
        user_id: row.user_id,
        account_id: account.id,
        card_id: row.card_id,
        workflow: row.driver,
        priority: "High",
        notes: `Activation ${row.code}`,
      } as never)
      .select("id")
      .single();
    if (taskError) throw new Error("We could not start the activation. Please try again.");

    await supabaseAdmin
      .from("activation_codes")
      .update({
        status: "Reserved",
        customer_email: data.email,
        customer_password_encrypted: encryptedPassword,
        task_id: task.id,
      } as never)
      .eq("id", row.id);

    await supabaseAdmin.from("logs").insert({
      user_id: row.user_id,
      task_id: task.id,
      level: "info",
      message: `Activation ${row.code} claimed by ${data.email}. Waiting for the automation engine.`,
    } as never);

    return { started: true as const, plan: workflow.planLabel };
  });

/** Step 3 — friendly progress only. No technical detail ever leaves here. */
export const activationProgress = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => codeInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin, row } = await loadCode(data.code);
    if (!row) throw new Error("This activation code was not found.");

    let progress = 0;
    let taskStatus = "Pending";
    if (row.task_id) {
      const { data: task } = await supabaseAdmin
        .from("tasks")
        .select("status, progress")
        .eq("id", row.task_id)
        .maybeSingle();
      if (task) {
        progress = (task as { progress: number }).progress ?? 0;
        taskStatus = (task as { status: string }).status ?? "Pending";
      }
    }

    if (row.status === "Activated") {
      return { state: "done" as const, progress: 100, stage: "Activation complete." };
    }
    if (row.status === "Cancelled" || taskStatus === "Failed" || taskStatus === "Cancelled") {
      return {
        state: "failed" as const,
        progress,
        stage: "We could not finish this activation. Please contact support.",
      };
    }
    if (taskStatus === "Paused") {
      return {
        state: "waiting" as const,
        progress,
        stage: "Waiting for the verification code sent to you…",
      };
    }

    return {
      state: "working" as const,
      progress,
      stage: customerStage(row.driver, progress),
    };
  });
