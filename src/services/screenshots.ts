import type { Screenshot } from "@/lib/types";
import { repository } from "./store";

const repo = repository<Screenshot>("screenshots");

export const screenshotsService = {
  async list(): Promise<Screenshot[]> {
    const rows = await repo.list();
    return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  async remove(id: string) {
    return repo.remove(id);
  },
};
