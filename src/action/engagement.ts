"use server";

import { and, count, eq, sql } from "drizzle-orm";
import z from "zod";
import { ActionError, requireUser, toActionError } from "@/server/auth/permissions";
import { db } from "@/server/db";
import { readLikes, reads } from "@/server/db/schema";

const fail = (error: unknown, context: string) => ({ success: false as const, ...toActionError(error, context) });
const readIdSchema = z.uuid();

// Counters are bumped in place and never cached: the article page reads them fresh.
async function bump(column: typeof reads.viewCount | typeof reads.shareCount, readId: unknown) {
  const parsed = readIdSchema.safeParse(readId);
  if (!parsed.success) return { success: false as const, error: "Article introuvable" };
  await db
    .update(reads)
    .set({ [column === reads.viewCount ? "viewCount" : "shareCount"]: sql`${column} + 1` })
    .where(and(eq(reads.readId, parsed.data), eq(reads.archived, false)));
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
      .where(and(eq(reads.readId, parsed.data), eq(reads.archived, false)))
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
