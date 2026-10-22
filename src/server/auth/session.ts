import "server-only";
import { passwordFingerprint } from "./tokens";
import { findUserById, toSessionUser, type UserRow } from "./users";

// How often a session is checked against the database: a changed password (other devices are
// signed out) or a changed role takes effect within this delay.
export const RECHECK_MS = 5 * 60 * 1000;

// The session JWT: the public profile, plus a fingerprint of the password hash and when it was checked.
export const sessionToken = (user: UserRow) => ({
  ...toSessionUser(user),
  pwfp: passwordFingerprint(user.password),
  checkedAt: Date.now(),
});

type Token = Record<string, unknown> & { userId?: unknown; pwfp?: unknown; checkedAt?: unknown };

// Reloads the profile when asked (update()) or when the last check is older than RECHECK_MS.
// null ends the session: the user is gone, or the password changed since the session was issued.
// Sessions issued before fingerprints existed adopt the current one. If the database can't be
// reached the session is kept, rather than signing everyone out.
export async function recheckToken<T extends Token>(token: T, force = false): Promise<T | null> {
  if (typeof token.userId !== "string") return token;
  const stale = typeof token.checkedAt !== "number" || Date.now() - token.checkedAt > RECHECK_MS;
  if (!force && !stale) return token;
  try {
    const fresh = await findUserById(token.userId);
    if (!fresh) return null;
    const next = sessionToken(fresh);
    if (typeof token.pwfp === "string" && token.pwfp !== next.pwfp) return null;
    return { ...token, ...next };
  } catch (error) {
    console.error("session recheck failed", error);
    return token;
  }
}
