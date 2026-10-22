import "server-only";
import { randomBytes } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { newsletterSubscribers, users } from "@/server/db/schema";

// The newsletter list (table newsletter_subscribers, migration 0004): one row per email, for visitors
// and readers alike. users.newsletter mirrors the row of a reader's own address.

const newToken = () => randomBytes(24).toString("base64url");

export function unsubscribeUrl(token: string) {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/+$/, "");
  return `${base}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}

// Subscribes (or re-subscribes) an address. Returns the unsubscribe token, and whether the address
// just became active (so the welcome email goes out once, not on every repeat).
export async function subscribe(email: string, userId?: string): Promise<{ token: string; activated: boolean }> {
  const [existing] = await db
    .select({ status: newsletterSubscribers.status, token: newsletterSubscribers.unsubscribeToken })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email))
    .limit(1);

  const [row] = await db
    .insert(newsletterSubscribers)
    .values({ email, userId, status: "active", unsubscribeToken: newToken() })
    .onConflictDoUpdate({
      target: newsletterSubscribers.email,
      set: {
        status: "active",
        userId: sql`coalesce(excluded.user_id, ${newsletterSubscribers.userId})`,
        updatedAt: new Date(),
      },
    })
    .returning({ token: newsletterSubscribers.unsubscribeToken });

  await db.update(users).set({ newsletter: true }).where(eq(users.email, email));
  return { token: row.token, activated: existing?.status !== "active" };
}

export async function unsubscribeEmail(email: string) {
  await db
    .update(newsletterSubscribers)
    .set({ status: "unsubscribed", updatedAt: new Date() })
    .where(eq(newsletterSubscribers.email, email));
  await db.update(users).set({ newsletter: false }).where(eq(users.email, email));
}

// From the link in an email. Returns the address (masked by the page) or null for an unknown token.
export async function unsubscribeByToken(token: string): Promise<string | null> {
  if (!token || token.length > 128) return null;
  const [row] = await db
    .select({ email: newsletterSubscribers.email })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.unsubscribeToken, token))
    .limit(1);
  if (!row) return null;
  await unsubscribeEmail(row.email);
  return row.email;
}

export async function isSubscribed(email: string): Promise<boolean> {
  const [row] = await db
    .select({ email: newsletterSubscribers.email })
    .from(newsletterSubscribers)
    .where(and(eq(newsletterSubscribers.email, email), eq(newsletterSubscribers.status, "active")))
    .limit(1);
  return Boolean(row);
}
