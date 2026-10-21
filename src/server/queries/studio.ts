import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { readDrafts, reads, users, watches } from "@/server/db/schema";
import { publicAuthor, toIso } from "./shared";

// Queries for the author studio and admin. Callers must have checked permissions;
// owner-scoped queries also filter by userId so one author can never load another's content.

type WithDates<T> = Omit<T, "createdAt" | "updatedAt"> & { createdAt: string; updatedAt: string };

function withIsoDates<T extends { createdAt: Date | null; updatedAt: Date | null }>(row: T): WithDates<T> {
  const createdAt = toIso(row.createdAt) ?? new Date(0).toISOString();
  return { ...row, createdAt, updatedAt: toIso(row.updatedAt) ?? createdAt };
}

export async function getAuthorReadsAndDrafts(userId: string) {
  const [drafts, published, [author]] = await Promise.all([
    db.select().from(readDrafts).where(eq(readDrafts.userId, userId)).orderBy(desc(readDrafts.updatedAt)),
    db.select().from(reads).where(eq(reads.userId, userId)).orderBy(desc(reads.createdAt)),
    db.select(publicAuthor).from(users).where(eq(users.userId, userId)).limit(1),
  ]);
  return {
    drafts: drafts.map((draft) => ({ ...withIsoDates(draft), user: author })),
    reads: published.map(withIsoDates),
  };
}

export async function getOwnDraft(readDraftId: string, userId: string) {
  const [draft] = await db
    .select()
    .from(readDrafts)
    .where(and(eq(readDrafts.readDraftId, readDraftId), eq(readDrafts.userId, userId)))
    .limit(1);
  return draft ? withIsoDates(draft) : null;
}

export async function getOwnRead(readId: string, userId: string) {
  const [read] = await db
    .select()
    .from(reads)
    .where(and(eq(reads.readId, readId), eq(reads.userId, userId)))
    .limit(1);
  return read ? withIsoDates(read) : null;
}

export async function getAuthorWatches(userId: string) {
  const rows = await db.select().from(watches).where(eq(watches.userId, userId)).orderBy(desc(watches.createdAt));
  return rows.map(withIsoDates);
}

export async function getOwnWatch(watchId: string, userId: string) {
  const [watch] = await db
    .select()
    .from(watches)
    .where(and(eq(watches.watchId, watchId), eq(watches.userId, userId)))
    .limit(1);
  return watch ? withIsoDates(watch) : null;
}

export async function getAllReadsForAdmin() {
  const rows = await db
    .select({
      readId: reads.readId,
      title: reads.title,
      featured: reads.featured,
      createdAt: reads.createdAt,
      updatedAt: reads.updatedAt,
      user: publicAuthor,
    })
    .from(reads)
    .leftJoin(users, eq(users.userId, reads.userId))
    .orderBy(desc(reads.createdAt));
  return rows.map((row) => ({
    ...withIsoDates(row),
    featured: row.featured ?? false,
    user: row.user ?? { firstName: "", lastName: "", profileImageUrl: null },
  }));
}

export type StudioDraft = NonNullable<Awaited<ReturnType<typeof getOwnDraft>>>;
export type StudioRead = NonNullable<Awaited<ReturnType<typeof getOwnRead>>>;
export type StudioWatch = NonNullable<Awaited<ReturnType<typeof getOwnWatch>>>;
export type AdminRead = Awaited<ReturnType<typeof getAllReadsForAdmin>>[number];
export type AuthorDraft = Awaited<ReturnType<typeof getAuthorReadsAndDrafts>>["drafts"][number];
