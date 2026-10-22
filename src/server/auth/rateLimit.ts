import "server-only";
import { createHash } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/server/db";
import { authRateLimits } from "@/server/db/schema";

// Fixed-window counters in Postgres (table auth_rate_limits), shared by every serverless instance.
// Keys are hashed so the table never holds a raw email or IP.
// Fails open: if the database refuses (e.g. the read-only local session), the request goes through.

export type Limit = { name: string; max: number; windowSeconds: number };

export const LIMITS = {
  loginEmail: { name: "login", max: 5, windowSeconds: 15 * 60 },
  loginIp: { name: "login-ip", max: 30, windowSeconds: 15 * 60 },
  registerEmail: { name: "register", max: 3, windowSeconds: 60 * 60 },
  registerIp: { name: "register-ip", max: 10, windowSeconds: 60 * 60 },
  resetIp: { name: "reset-ip", max: 10, windowSeconds: 60 * 60 },
  newsletterIp: { name: "newsletter-ip", max: 10, windowSeconds: 60 * 60 },
  newsletterEmail: { name: "newsletter", max: 3, windowSeconds: 60 * 60 },
} satisfies Record<string, Limit>;

const hashKey = (limit: Limit, subject: string) =>
  createHash("sha256").update(`${limit.name}:${subject.toLowerCase()}`).digest("base64url");

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

// Seconds until the window resets when the subject is over the limit, otherwise 0. Doesn't count.
export async function blockedFor(limit: Limit, subject: string): Promise<number> {
  try {
    const [row] = await db.select().from(authRateLimits).where(eq(authRateLimits.key, hashKey(limit, subject))).limit(1);
    if (!row || row.resetAt.getTime() <= Date.now() || row.count < limit.max) return 0;
    return Math.ceil((row.resetAt.getTime() - Date.now()) / 1000);
  } catch (error) {
    console.error("rate limit check failed", error);
    return 0;
  }
}

// Counts one attempt (a new window starts once the previous one has expired).
export async function hit(limit: Limit, subject: string): Promise<void> {
  try {
    const resetAt = sql`now() + make_interval(secs => ${limit.windowSeconds})`;
    await db
      .insert(authRateLimits)
      .values({ key: hashKey(limit, subject), count: 1, resetAt })
      .onConflictDoUpdate({
        target: authRateLimits.key,
        set: {
          count: sql`case when ${authRateLimits.resetAt} <= now() then 1 else ${authRateLimits.count} + 1 end`,
          resetAt: sql`case when ${authRateLimits.resetAt} <= now() then ${resetAt} else ${authRateLimits.resetAt} end`,
        },
      });
  } catch (error) {
    console.error("rate limit hit failed", error);
  }
}

// Checks, then counts: for actions where every attempt counts (sending an email).
export async function consume(limit: Limit, subject: string): Promise<number> {
  const wait = await blockedFor(limit, subject);
  if (wait > 0) return wait;
  await hit(limit, subject);
  return 0;
}

export async function clear(limit: Limit, subject: string): Promise<void> {
  try {
    await db.delete(authRateLimits).where(eq(authRateLimits.key, hashKey(limit, subject)));
  } catch (error) {
    console.error("rate limit clear failed", error);
  }
}

export const waitMessage = (seconds: number) =>
  `Trop de tentatives. Réessayez dans ${Math.max(1, Math.ceil(seconds / 60))} minute(s).`;
