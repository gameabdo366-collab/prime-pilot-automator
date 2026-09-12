import type { WorkflowDefinition } from "./types";

/**
 * Driver registry. Adding a future driver (ChatGPT, Claude, Microsoft, Spotify,
 * EA …) means adding one entry here — the dashboard, activation codes, the
 * customer portal and the task pipeline all read from this list.
 */
export const WORKFLOWS: WorkflowDefinition[] = [
  {
    key: "amazon_eg_prime_annual",
    name: "Amazon Egypt — Prime Annual Renewal",
    target: "amazon.eg",
    description:
      "Signs in, checks whether Prime is already active, and only then subscribes to the annual plan with a temporary card.",
    requiresCard: true,
    steps: [
      "Open amazon.eg",
      "Sign in",
      "Open Prime page",
      "Check current membership",
      "Select annual plan",
      "Verify displayed price",
      "Enter payment card",
      "Enter billing address",
      "Review order",
      "Confirm subscription",
      "Re-read membership status",
    ],
    available: true,
    codePrefix: "AMZ",
    planLabel: "Amazon Prime Annual (12 Months)",
    customerStages: [
      "Connecting…",
      "Signing into Amazon…",
      "Checking Prime membership…",
      "Preparing activation…",
      "Activating Prime…",
      "Verifying subscription…",
      "Almost finished…",
    ],
  },
  {
    key: "account_health_check",
    name: "Account Health Check",
    target: "amazon.eg",
    description: "Signs in and reads membership status and renewal date without any payment.",
    requiresCard: false,
    steps: ["Open amazon.eg", "Sign in", "Open Prime page", "Read status", "Read renewal date"],
    available: true,
    codePrefix: "CHK",
    planLabel: "Membership Status Check",
    customerStages: [
      "Connecting…",
      "Signing in…",
      "Checking membership…",
      "Almost finished…",
    ],
  },
];

export function getWorkflow(key: string): WorkflowDefinition | undefined {
  return WORKFLOWS.find((w) => w.key === key);
}

export function workflowName(key: string): string {
  return getWorkflow(key)?.name ?? key;
}

export function planLabel(key: string): string {
  return getWorkflow(key)?.planLabel ?? "Subscription activation";
}

/** Turns a task's numeric progress into the customer-facing stage message. */
export function customerStage(key: string, progress: number): string {
  const stages = getWorkflow(key)?.customerStages ?? ["Working…"];
  const index = Math.min(stages.length - 1, Math.floor((progress / 100) * stages.length));
  return stages[Math.max(0, index)] ?? "Working…";
}
