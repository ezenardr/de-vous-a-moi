import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { hashPassword } from "./password";
import { findUserByEmail, type UserRow } from "./users";

export type GoogleProfile = { email: string; firstName: string; lastName: string };

// The cookie holding the popup's anti-CSRF state (double submit: set by the page, echoed by Google).
export const GOOGLE_STATE_COOKIE = "g_state";

// Checks the ID token claims. The token comes straight from Google's token endpoint over TLS, which
// OpenID Connect accepts in place of checking its signature (Core 3.1.3.7, item 6).
export function verifiedGoogleProfile(claims: Record<string, unknown>, clientId: string, now = Date.now()): GoogleProfile | null {
  const issuerOk = claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com";
  const audienceOk = claims.aud === clientId;
  const fresh = typeof claims.exp === "number" && claims.exp * 1000 > now;
  // Accounts are linked by email, so only addresses Google has verified.
  const verified = claims.email_verified === true && typeof claims.email === "string";
  if (!issuerOk || !audienceOk || !fresh || !verified) return null;
  return {
    email: String(claims.email).toLowerCase(),
    firstName: typeof claims.given_name === "string" ? claims.given_name : "",
    lastName: typeof claims.family_name === "string" ? claims.family_name : "",
  };
}

// Exchanges the code from the Google Identity Services popup (redirect_uri "postmessage").
export async function exchangeGoogleCode(code: string): Promise<GoogleProfile | null> {
  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;
  if (!clientId || !clientSecret) return null;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: "postmessage",
      grant_type: "authorization_code",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) return null;
  const { id_token } = (await res.json()) as { id_token?: string };
  const payload = id_token?.split(".")[1];
  if (!payload) return null;
  try {
    return verifiedGoogleProfile(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")), clientId);
  } catch {
    return null;
  }
}

// Google accounts are matched to users by verified email; new ones get a random password nobody
// knows (they can set one through "forgot password").
export async function findOrCreateGoogleUser({ email, firstName, lastName }: GoogleProfile): Promise<UserRow | null> {
  const existing = await findUserByEmail(email);
  if (existing) return existing;
  const now = new Date();
  await db
    .insert(users)
    .values({
      userId: randomUUID(),
      firstName: firstName || email.split("@")[0],
      lastName,
      email,
      password: await hashPassword(randomBytes(32).toString("hex")),
      role: "1",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing({ target: users.email });
  return findUserByEmail(email);
}
