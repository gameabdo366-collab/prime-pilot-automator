/**
 * Storage adapter (database boundary).
 *
 * Every table lives behind this tiny async repository API. When the managed
 * database is connected, only this file is replaced with server calls —
 * services and screens keep working unchanged.
 */

const PREFIX = "atlas.v1.";

function isBrowser() {
  return typeof window !== "undefined";
}

function read<T>(table: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + table);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(table: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(PREFIX + table, JSON.stringify(value));
  } catch {
    /* storage full or unavailable */
  }
}

export function newId(): string {
  if (isBrowser() && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export interface Row {
  id: string;
}

export function repository<T extends Row>(table: string) {
  return {
    async list(): Promise<T[]> {
      return read<T[]>(table, []);
    },
    async find(id: string): Promise<T | undefined> {
      return read<T[]>(table, []).find((row) => row.id === id);
    },
    async insert(row: T): Promise<T> {
      const rows = read<T[]>(table, []);
      write(table, [row, ...rows]);
      return row;
    },
    async update(id: string, patch: Partial<T>): Promise<T | undefined> {
      const rows = read<T[]>(table, []);
      let updated: T | undefined;
      const next = rows.map((row) => {
        if (row.id !== id) return row;
        updated = { ...row, ...patch };
        return updated;
      });
      write(table, next);
      return updated;
    },
    async remove(id: string): Promise<void> {
      write(
        table,
        read<T[]>(table, []).filter((row) => row.id !== id),
      );
    },
    async replaceAll(rows: T[]): Promise<void> {
      write(table, rows);
    },
  };
}

export function singleton<T>(table: string, fallback: T) {
  return {
    async get(): Promise<T> {
      return { ...fallback, ...read<Partial<T>>(table, {}) } as T;
    },
    async set(value: T): Promise<T> {
      write(table, value);
      return value;
    },
  };
}
