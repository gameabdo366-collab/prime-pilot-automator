import type { WorkflowDefinition } from "./types";

/**
 * Driver registry. Adding a future driver means adding an entry here —
 * the dashboard, workflow builder and task pipeline read from this list.
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
  },
  {
    key: "account_health_check",
    name: "Account Health Check",
    target: "amazon.eg",
    description: "Signs in and reads membership status and renewal date without any payment.",
    requiresCard: false,
    steps: ["Open amazon.eg", "Sign in", "Open Prime page", "Read status", "Read renewal date"],
    available: true,
  },
];

export function getWorkflow(key: string): WorkflowDefinition | undefined {
  return WORKFLOWS.find((w) => w.key === key);
}

export function workflowName(key: string): string {
  return getWorkflow(key)?.name ?? key;
}
