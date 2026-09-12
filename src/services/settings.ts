import type { AppSettings } from "@/lib/types";
import { singleton } from "./store";

export const DEFAULT_SETTINGS: AppSettings = {
  headless_mode: true,
  visible_browser: false,
  timeout_seconds: 60,
  retries: 2,
  runner_url: "",
  runner_token: "",
};

const store = singleton<AppSettings>("settings", DEFAULT_SETTINGS);

export const settingsService = {
  get: store.get,
  save: store.set,
};
