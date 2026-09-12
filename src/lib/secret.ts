/**
 * Secret handling boundary.
 *
 * Right now values are only encoded at rest in local storage, because the
 * managed database and its server-side encryption key are not connected yet.
 * When the backend is enabled, replace these two functions with calls to the
 * server encryption helpers — no screen imports the raw values directly.
 */

export function sealSecret(value: string): string {
  if (!value) return "";
  try {
    return `enc:${btoa(unescape(encodeURIComponent(value)))}`;
  } catch {
    return value;
  }
}

export function revealSecret(value: string): string {
  if (!value) return "";
  if (!value.startsWith("enc:")) return value;
  try {
    return decodeURIComponent(escape(atob(value.slice(4))));
  } catch {
    return "";
  }
}

export function maskCardNumber(sealed: string): string {
  const raw = revealSecret(sealed).replace(/\s+/g, "");
  if (raw.length < 4) return "•••• ••••";
  return `•••• •••• •••• ${raw.slice(-4)}`;
}

export function maskPassword(sealed: string): string {
  const raw = revealSecret(sealed);
  return raw ? "•".repeat(Math.min(10, Math.max(6, raw.length))) : "—";
}

export function formatCardNumber(sealed: string): string {
  const raw = revealSecret(sealed).replace(/\s+/g, "");
  return raw.replace(/(.{4})/g, "$1 ").trim();
}
