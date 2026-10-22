"use server";

import { publicWatch } from "@/server/queries/watches";
import { publicRead } from "@/server/queries/reads";
import { and, count, eq, sql } from "drizzle-orm";
import z from "zod";
import { ActionError, requireUser, toActionError } from "@/server/auth/permissions";
import { clientIp, consume, LIMITS } from "@/server/auth/rateLimit";
import { db } from "@/server/db";
import { readLikes, reads, watchLikes, watches } from "@/server/db/schema";

const fail = (error: unknown, context: string) => ({ success: false as const, ...toActionError(error, context) });
const readIdSchema = z.uuid();

// Counters anyone can bump (views and shares need no account), so each visitor (IP) counts once per
// item per hour for views and a few times for shares. Over the limit the call still "succeeds": nothing
// is counted and nothing tells a script it was ignored.
async function countOnce(kind: "view" | "share", item: string) {
  const wait = await consume(kind === "view" ? LIMITS.view : LIMITS.share, `${await clientIp()}:${item}`);
  return wait === 0;
}

// Counters are bumped in place and never cached: the article page reads them fresh.
async function bump(column: typeof reads.viewCount | typeof reads.shareCount, readId: unknown) {
  const parsed = readIdSchema.safeParse(readId);
  if (!parsed.success) return { success: false as const, error: "Article introuvable" };
  if (!(await countOnce(column === reads.viewCount ? "view" : "share", `read:${parsed.data}`))) return { success: true as const };
  await db
    .update(reads)
    .set({ [column === reads.viewCount ? "viewCount" : "shareCount"]: sql`${column} + 1` })
    .where(and(eq(reads.readId, parsed.data), publicRead));
  return { success: true as const };
}

// Called once per browser session by the article page (see ViewTracker).
export async function recordReadView(readId: string) {
  try {
    return await bump(reads.viewCount, readId);
  } catch (error) {
    return fail(error, "recordReadView");
  }
}

// Called when a reader copies the link or uses a social button in the share dialog.
export async function recordReadShare(readId: string) {
  try {
    return await bump(reads.shareCount, readId);
  } catch (error) {
    return fail(error, "recordReadShare");
  }
}

export async function toggleReadLike(readId: string) {
  try {
    const user = await requireUser();
    const parsed = readIdSchema.safeParse(readId);
    if (!parsed.success) throw new ActionError("Article introuvable");
    const [read] = await db
      .select({ readId: reads.readId })
      .from(reads)
      .where(and(eq(reads.readId, parsed.data), publicRead))
      .limit(1);
    if (!read) throw new ActionError("Article introuvable");

    const removed = await db
      .delete(readLikes)
      .where(and(eq(readLikes.readId, read.readId), eq(readLikes.userId, user.userId)))
      .returning({ readId: readLikes.readId });
    if (removed.length === 0) {
      await db.insert(readLikes).values({ readId: read.readId, userId: user.userId }).onConflictDoNothing();
    }
    const [{ likes }] = await db.select({ likes: count() }).from(readLikes).where(eq(readLikes.readId, read.readId));
    return { success: true as const, liked: removed.length === 0, likes };
  } catch (error) {
    return fail(error, "toggleReadLike");
  }
}

// ---------------------------------------------------------------------------------------------
// Videos: same counters and likes as articles (migration 0002).
async function bumpWatch(column: typeof watches.viewCount | typeof watches.shareCount, watchId: unknown) {
  const parsed = readIdSchema.safeParse(watchId);
  if (!parsed.success) return { success: false as const, error: "Vidéo introuvable" };
  if (!(await countOnce(column === watches.viewCount ? "view" : "share", `watch:${parsed.data}`))) return { success: true as const };
  await db
    .update(watches)
    .set({ [column === watches.viewCount ? "viewCount" : "shareCount"]: sql`${column} + 1` })
    .where(and(eq(watches.watchId, parsed.data), publicWatch));
  return { success: true as const };
}

export async function recordWatchView(watchId: string) {
  try {
    return await bumpWatch(watches.viewCount, watchId);
  } catch (error) {
    return fail(error, "recordWatchView");
  }
}

export async function recordWatchShare(watchId: string) {
  try {
    return await bumpWatch(watches.shareCount, watchId);
  } catch (error) {
    return fail(error, "recordWatchShare");
  }
}

export async function toggleWatchLike(watchId: string) {
  try {
    const user = await requireUser();
    const parsed = readIdSchema.safeParse(watchId);
    if (!parsed.success) throw new ActionError("Vidéo introuvable");
    const [watch] = await db
      .select({ watchId: watches.watchId })
      .from(watches)
      .where(and(eq(watches.watchId, parsed.data), publicWatch))
      .limit(1);
    if (!watch) throw new ActionError("Vidéo introuvable");

    const removed = await db
      .delete(watchLikes)
      .where(and(eq(watchLikes.watchId, watch.watchId), eq(watchLikes.userId, user.userId)))
      .returning({ watchId: watchLikes.watchId });
    if (removed.length === 0) {
      await db.insert(watchLikes).values({ watchId: watch.watchId, userId: user.userId }).onConflictDoNothing();
    }
    const [{ likes }] = await db.select({ likes: count() }).from(watchLikes).where(eq(watchLikes.watchId, watch.watchId));
    return { success: true as const, liked: removed.length === 0, likes };
  } catch (error) {
    return fail(error, "toggleWatchLike");
  }
}
