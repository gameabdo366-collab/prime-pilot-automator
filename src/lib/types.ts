/**
 * Domain model. Field names mirror the database columns so the services layer
 * stays a thin, typed pass-through.
 */

export type AccountStatus = "Active" | "Inactive" | "Expired" | "Unknown";

export interface Account {
  id: string;
  email: string;
  /** AES-GCM ciphertext; only revealed through the vault API. */
  password_encrypted: string;
  notes: string;
  status: AccountStatus;
  prime_expiration: string | null;
  last_execution: string | null;
  created_at: string;
  updated_at: string;
}

export type CardStatus = "Available" | "Running" | "Consumed" | "Expired" | "Failed";

export interface Card {
  id: string;
  alias: string;
  card_number_encrypted: string;
  card_last4: string;
  expiry: string;
  cvv_encrypted: string;
  /** When this temporary virtual card stops being usable. */
  expires_at: string | null;
  notes: string;
  status: CardStatus;
  created_at: string;
  updated_at: string;
}

export type TaskStatus =
  | "Pending"
  | "Running"
  | "Paused"
  | "Completed"
  | "Failed"
  | "Cancelled";

export type TaskPriority = "Low" | "Normal" | "High" | "Urgent";

export interface Task {
  id: string;
  account_id: string | null;
  card_id: string | null;
  workflow: string;
  status: TaskStatus;
  progress: number;
  priority: TaskPriority;
  notes: string;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  id: string;
  task_id: string | null;
  level: LogLevel;
  message: string;
  created_at: string;
}

export interface Screenshot {
  id: string;
  task_id: string | null;
  image: string;
  step: string;
  created_at: string;
}

export interface AppSettings {
  headless_mode: boolean;
  visible_browser: boolean;
  timeout_seconds: number;
  retries: number;
  runner_url: string;
  runner_token: string;
}

/** Registry entry for an automation driver. New drivers plug in here. */
export interface WorkflowDefinition {
  key: string;
  name: string;
  target: string;
  description: string;
  requiresCard: boolean;
  steps: string[];
  available: boolean;
  /** Short prefix used at the front of generated activation codes, e.g. AMZ. */
  codePrefix: string;
  /** Customer-facing product line shown in the activation portal. */
  planLabel: string;
  /** Customer-facing progress messages, in order. Never technical. */
  customerStages: string[];
}

export type ActivationStatus =
  | "Unused"
  | "Reserved"
  | "Running"
  | "Activated"
  | "Expired"
  | "Cancelled";

export interface ActivationCode {
  id: string;
  code: string;
  driver: string;
  card_id: string | null;
  task_id: string | null;
  status: ActivationStatus;
  customer_email: string;
  /** AES-GCM ciphertext; only the automation engine ever decrypts it. */
  customer_password_encrypted: string;
  renewal_date: string | null;
  activated_at: string | null;
  expires_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}
