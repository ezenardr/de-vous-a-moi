import "server-only";
import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes } from "node:crypto";

// Encrypted, expiring tokens for links sent by email (AES-256-GCM, key derived from AUTH_SECRET).
// Unlike the JWTs the Adonis API used, the payload is unreadable without the secret,
// and each token is bound to one purpose so a token minted for one flow can't be replayed in another.
export type TokenPurpose = "registration" | "password-reset";

function key(purpose: TokenPurpose) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return Buffer.from(hkdfSync("sha256", secret, "devousamoi-email-tokens", purpose, 32));
}

export function sealToken(purpose: TokenPurpose, payload: object, ttlSeconds: number): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(purpose), iv);
  const body = JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds });
  const encrypted = Buffer.concat([cipher.update(body, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

export function openToken<T>(purpose: TokenPurpose, token: string): T | null {
  try {
    const raw = Buffer.from(token, "base64url");
    if (raw.length < 29) return null;
    const decipher = createDecipheriv("aes-256-gcm", key(purpose), raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const body = Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8");
    const { exp, ...payload } = JSON.parse(body);
    if (typeof exp !== "number" || exp < Date.now() / 1000) return null;
    return payload as T;
  } catch {
    return null;
  }
}

// Short fingerprint of the stored password hash. A reset token carries it, so the token
// stops working as soon as the password changes: single use, with no token table.
export const passwordFingerprint = (passwordHash: string) =>
  createHash("sha256").update(passwordHash).digest("base64url").slice(0, 16);
