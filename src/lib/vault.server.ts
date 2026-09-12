/**
 * Server-only encryption helpers for the vault (account passwords, card data).
 * AES-256-GCM with a key derived from VAULT_ENCRYPTION_KEY.
 * Plain values never leave the server unless the owner explicitly reveals them.
 */

async function getKey(): Promise<CryptoKey> {
  const secret = process.env["VAULT_ENCRYPTION_KEY"];
  if (!secret) throw new Error("Vault encryption key is not configured.");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function encryptValue(plain: string): Promise<string> {
  if (!plain) return "";
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plain),
  );
  return `v1.${toBase64(iv)}.${toBase64(new Uint8Array(cipher))}`;
}

export async function decryptValue(sealed: string): Promise<string> {
  if (!sealed) return "";
  const [version, ivPart, dataPart] = sealed.split(".");
  if (version !== "v1" || !ivPart || !dataPart) return "";
  const key = await getKey();
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(ivPart) },
      key,
      fromBase64(dataPart),
    );
    return new TextDecoder().decode(plain);
  } catch {
    return "";
  }
}
