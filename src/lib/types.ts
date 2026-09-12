/**
 * Domain model for the automation platform.
 * These types are the contract between the UI and the data layer,
 * so the storage backend can be swapped without touching screens.
 */

export type AccountStatus = "Active" | "Inactive" | "Expired" | "Unknown";

export interface Account {
  id: string;
  email: string;
  /** Stored via the secret layer, never displayed in plain text by default. */
  password: string;
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
  /** Stored via the secret layer. */
  card_number: string;
  expiry: string;
  /** Stored via the secret layer. */
  cvv: string;
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
  /** Public URL or data URL of the captured image. */
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
}
