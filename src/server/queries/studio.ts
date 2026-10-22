import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { favorites, readComments, readDrafts, readLikes, reads, users, watchComments, watches, watchFavorites, watchLikes } from "@/server/db/schema";
import { publicAuthor, toIso } from "./shared";

// Queries for the author studio and admin. Callers must have checked permissions;
// owner-scoped queries also filter by userId so one author can never load another's content.

type WithDates<T> = Omit<T, "createdAt" | "updatedAt"> & { createdAt: string; updatedAt: string };

function withIsoDates<T extends { createdAt: Date | null; updatedAt: Date | null }>(row: T): WithDates<T> {
  const createdAt = toIso(row.createdAt) ?? new Date(0).toISOString();
  return { ...row, createdAt, updatedAt: toIso(row.updatedAt) ?? createdAt };
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

export type AdminRead = Awaited<ReturnType<typeof getAllReadsForAdmin>>[number];

// ---------------------------------------------------------------------------------------------
// Studio lists and detail pages: no article bodies, a status, the publication date and the counts.

export type StudioStatus = "published" | "scheduled" | "archived";
export type StudioStats = { views: number; likes: number; comments: number; shares: number; saves: number };
export type StudioItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  status: StudioStatus;
  publishedAt: string; // when it went (or goes) public
  updatedAt: string;
  durationSeconds: number | null;
  videoUrl: string | null;
  stats: StudioStats;
};


function selectStudioReads() {
  return db
    .select({
      id: reads.readId,
      title: reads.title,
      description: reads.description,
      imageUrl: reads.imageUrl,
      category: reads.category,
      archived: reads.archived,
      publishedAt: sql<Date>`coalesce(${reads.publishedAt}, ${reads.createdAt})`.mapWith(reads.createdAt),
      updatedAt: reads.updatedAt,
      views: reads.viewCount,
      shares: reads.shareCount,
      likes: sql<number>`(select count(*) from ${readLikes} where ${readLikes.readId} = ${reads.readId})`.mapWith(Number),
      comments: sql<number>`(select count(*) from ${readComments} where ${readComments.readId} = ${reads.readId})`.mapWith(Number),
      saves: sql<number>`(select count(*) from ${favorites} where ${favorites.readId} = ${reads.readId})`.mapWith(Number),
    })
    .from(reads)
    .$dynamic();
}

function selectStudioWatches() {
  return db
    .select({
      id: watches.watchId,
      title: watches.title,
      description: watches.description,
      imageUrl: watches.imageUrl,
      category: watches.category,
      archived: watches.archived,
      publishedAt: sql<Date>`coalesce(${watches.publishedAt}, ${watches.createdAt})`.mapWith(watches.createdAt),
      updatedAt: watches.updatedAt,
      views: watches.viewCount,
      shares: watches.shareCount,
      durationSeconds: watches.durationSeconds,
      videoUrl: watches.videoUrl,
      likes: sql<number>`(select count(*) from ${watchLikes} where ${watchLikes.watchId} = ${watches.watchId})`.mapWith(Number),
      comments: sql<number>`(select count(*) from ${watchComments} where ${watchComments.watchId} = ${watches.watchId})`.mapWith(Number),
      saves: sql<number>`(select count(*) from ${watchFavorites} where ${watchFavorites.watchId} = ${watches.watchId})`.mapWith(Number),
    })
    .from(watches)
    .$dynamic();
}

type StudioRow = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  archived: boolean | null;
  publishedAt: Date | null;
  updatedAt: Date | null;
  views: number;
  shares: number;
  likes: number;
  comments: number;
  saves: number;
  durationSeconds?: number | null;
  videoUrl?: string;
};

function toStudioItem({ archived, publishedAt, updatedAt, views, shares, likes, comments, saves, durationSeconds, videoUrl, ...row }: StudioRow): StudioItem {
  const published = publishedAt ?? new Date(0);
  return {
    ...row,
    status: archived ? "archived" : published.getTime() > Date.now() ? "scheduled" : "published",
    publishedAt: published.toISOString(),
    updatedAt: (updatedAt ?? published).toISOString(),
    durationSeconds: durationSeconds ?? null,
    videoUrl: videoUrl ?? null,
    stats: { views, likes, comments, shares, saves },
  };
}

export function sumStats(items: StudioItem[]): StudioStats {
  return items
    .filter((item) => item.status === "published")
    .reduce(
      (total, { stats }) => ({
        views: total.views + stats.views,
        likes: total.likes + stats.likes,
        comments: total.comments + stats.comments,
        shares: total.shares + stats.shares,
        saves: total.saves + stats.saves,
      }),
      { views: 0, likes: 0, comments: 0, shares: 0, saves: 0 },
    );
}

export type StudioDraftItem = { id: string; title: string | null; description: string | null; imageUrl: string | null; category: string | null; updatedAt: string };

export async function getStudioReads(userId: string) {
  const [rows, drafts] = await Promise.all([
    selectStudioReads().where(eq(reads.userId, userId)).orderBy(desc(sql`coalesce(${reads.publishedAt}, ${reads.createdAt})`)),
    db
      .select({
        id: readDrafts.readDraftId,
        title: readDrafts.title,
        description: readDrafts.description,
        imageUrl: readDrafts.imageUrl,
        category: readDrafts.category,
        updatedAt: readDrafts.updatedAt,
        createdAt: readDrafts.createdAt,
      })
      .from(readDrafts)
      .where(eq(readDrafts.userId, userId))
      .orderBy(desc(readDrafts.updatedAt)),
  ]);
  const items = rows.map(toStudioItem);
  return {
    items,
    drafts: drafts.map(({ createdAt, updatedAt, ...d }): StudioDraftItem => ({ ...d, updatedAt: (updatedAt ?? createdAt ?? new Date(0)).toISOString() })),
    totals: sumStats(items),
  };
}

export async function getStudioRead(readId: string, userId: string): Promise<StudioItem | null> {
  const [row] = await selectStudioReads().where(and(eq(reads.readId, readId), eq(reads.userId, userId))).limit(1);
  return row ? toStudioItem(row) : null;
}

export async function getStudioWatches(userId: string) {
  const rows = await selectStudioWatches().where(eq(watches.userId, userId)).orderBy(desc(sql`coalesce(${watches.publishedAt}, ${watches.createdAt})`));
  const items = rows.map(toStudioItem);
  return { items, totals: sumStats(items) };
}

export async function getStudioWatch(watchId: string, userId: string): Promise<StudioItem | null> {
  const [row] = await selectStudioWatches().where(and(eq(watches.watchId, watchId), eq(watches.userId, userId))).limit(1);
  return row ? toStudioItem(row) : null;
}
