import "server-only";
import { unstable_cache } from "next/cache";
import { and, desc, eq, isNull, lte, ne, or, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { users, watchComments, watchFavorites, watchLikes, watches } from "@/server/db/schema";
import { getCommentThreads } from "./comments";
import type { ArticleEngagement } from "./reads";
import { publicAuthor, toIso, type PublicAuthor } from "./shared";

export type WatchSummary = {
  watchId: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  videoUrl: string;
  featured: boolean;
  viewCount: number;
  durationSeconds: number | null;
  favoriteCount: number;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string | null;
  user: PublicAuthor;
};

export type WatchComment = {
  watchCommentId: string;
  comment: string;
  createdAt: string;
  user: PublicAuthor;
};

export type WatchDetail = WatchSummary & { comments: WatchComment[] };

// Public = not archived and already published (published_at, migration 0005, may schedule it for later;
// null means public since created_at). Shared with the actions so likes, comments and views agree.
export const publicWatch = and(eq(watches.archived, false), or(isNull(watches.publishedAt), lte(watches.publishedAt, sql`now()`)))!;
const isPublic = publicWatch;
// The date readers see and lists sort by: the publication date.
const watchDate = sql<Date>`coalesce(${watches.publishedAt}, ${watches.createdAt})`.mapWith(watches.createdAt);

function selectWatch(viewerId?: string) {
  return db
    .select({
      watchId: watches.watchId,
      title: watches.title,
      description: watches.description,
      imageUrl: watches.imageUrl,
      category: watches.category,
      videoUrl: watches.videoUrl,
      featured: watches.featured,
      viewCount: watches.viewCount,
      durationSeconds: watches.durationSeconds,
      createdAt: watchDate,
      updatedAt: watches.updatedAt,
      favoriteCount: sql<number>`(select count(*) from ${watchFavorites} where ${watchFavorites.watchId} = ${watches.watchId})`.mapWith(Number),
      isSaved: viewerId
        ? sql<boolean>`exists(select 1 from ${watchFavorites} where ${watchFavorites.watchId} = ${watches.watchId} and ${watchFavorites.userId} = ${viewerId})`
        : sql<boolean>`false`,
      user: publicAuthor,
    })
    .from(watches)
    .leftJoin(users, eq(users.userId, watches.userId))
    .$dynamic();
}

type WatchRow = Awaited<ReturnType<ReturnType<typeof selectWatch>["execute"]>>[number];

function toSummary({ createdAt, updatedAt, featured, user, ...row }: WatchRow): WatchSummary {
  return {
    ...row,
    featured: featured ?? false,
    createdAt: toIso(createdAt)!,
    updatedAt: toIso(updatedAt),
    user: user ?? { firstName: "", lastName: "", profileImageUrl: null },
  };
}


export async function getLatestWatches({ limit, viewerId }: { limit?: number; viewerId?: string } = {}) {
  const query = selectWatch(viewerId).where(isPublic).orderBy(desc(watchDate));
  const rows = await (limit ? query.limit(limit) : query);
  return rows.map(toSummary);
}

export async function getWatch(watchId: string, viewerId?: string): Promise<WatchDetail | null> {
  const [row] = await selectWatch(viewerId)
    .where(and(isPublic, eq(watches.watchId, watchId)))
    .limit(1);
  if (!row) return null;

  const comments = await db
    .select({
      watchCommentId: watchComments.watchCommentId,
      comment: watchComments.comment,
      createdAt: watchComments.createdAt,
      user: publicAuthor,
    })
    .from(watchComments)
    .leftJoin(users, eq(users.userId, watchComments.userId))
    .where(and(eq(watchComments.watchId, watchId), isNull(watchComments.hiddenAt)))
    .orderBy(desc(watchComments.createdAt));

  return {
    ...toSummary(row),
    comments: comments.map(({ createdAt, user, ...comment }) => ({
      ...comment,
      createdAt: toIso(createdAt)!,
      user: user ?? { firstName: "", lastName: "", profileImageUrl: null },
    })),
  };
}

export async function getSitemapWatches() {
  return db
    .select({ watchId: watches.watchId, title: watches.title, createdAt: watches.createdAt, updatedAt: watches.updatedAt })
    .from(watches)
    .where(isPublic)
    .orderBy(desc(watchDate));
}

export async function getMostSavedWatches(limit: number) {
  const rows = await selectWatch()
    .where(isPublic)
    .orderBy(desc(sql`(select count(*) from ${watchFavorites} where ${watchFavorites.watchId} = ${watches.watchId})`), desc(watchDate))
    .limit(limit);
  return rows.map(toSummary);
}

// ---------------------------------------------------------------------------------------------
// Cached public data, as for reads: never visitor-dependent; the visitor's saved state is merged
// in per request. Invalidated with revalidateTag(WATCHES_TAG, …).
export const WATCHES_TAG = "watches";
export const watchTag = (watchId: string) => `watch:${watchId}`;

// Videos list (Figma 153:14223): two featured (flagged first, then newest), the 6 latest others,
// then 5 "you might like" (most-saved not already shown).
export const getWatchesHome = unstable_cache(
  async () => {
    const [top, recent, popular] = await Promise.all([
      selectWatch().where(isPublic).orderBy(desc(watches.featured), desc(watchDate)).limit(2),
      getLatestWatches({ limit: 8 }),
      getMostSavedWatches(15),
    ]);
    const featured = top.map(toSummary);
    const shown = new Set(featured.map((w) => w.watchId));
    const latest = recent.filter((w) => !shown.has(w.watchId)).slice(0, 6);
    latest.forEach((w) => shown.add(w.watchId));
    const mightLike = popular.filter((w) => !shown.has(w.watchId)).slice(0, 5);
    return { featured, latest, mightLike };
  },
  ["watches-home-v1"],
  { tags: [WATCHES_TAG], revalidate: 300 },
);

export const getAllWatchesCached = unstable_cache(() => getLatestWatches(), ["all-watches-v1"], {
  tags: [WATCHES_TAG],
  revalidate: 300,
});

export async function getSavedWatchIds(userId: string | undefined): Promise<Set<string>> {
  if (!userId) return new Set();
  const rows = await db.select({ watchId: watchFavorites.watchId }).from(watchFavorites).where(eq(watchFavorites.userId, userId));
  return new Set(rows.map((row) => row.watchId!));
}

export const markWatchesSaved = (list: WatchSummary[], saved: Set<string>) =>
  list.map((watch) => ({ ...watch, isSaved: saved.has(watch.watchId) }));

// Video page (Figma 153:14779). The video and its recommendations are cached; engagement is fresh.
export type WatchPageData = { watch: WatchSummary; recommended: WatchSummary[] };

export function getWatchPage(watchId: string): Promise<WatchPageData | null> {
  return unstable_cache(
    async (): Promise<WatchPageData | null> => {
      const [row] = await selectWatch().where(and(isPublic, eq(watches.watchId, watchId))).limit(1);
      if (!row) return null;
      const others = await selectWatch()
        .where(and(isPublic, ne(watches.watchId, watchId)))
        .orderBy(desc(watchDate))
        .limit(3);
      return { watch: toSummary(row), recommended: others.map(toSummary) };
    },
    ["watch-page-v1", watchId],
    { tags: [WATCHES_TAG, watchTag(watchId)], revalidate: 300 },
  )();
}

// Same shape as the article's, so both pages share ArticleEngagement.
export type WatchEngagement = ArticleEngagement;

export async function getWatchEngagement(watchId: string, viewerId?: string): Promise<WatchEngagement> {
  const [[stats], comments] = await Promise.all([
    db
      .select({
        views: watches.viewCount,
        shares: watches.shareCount,
        likes: sql<number>`(select count(*) from ${watchLikes} where ${watchLikes.watchId} = ${watches.watchId})`.mapWith(Number),
        liked: viewerId
          ? sql<boolean>`exists(select 1 from ${watchLikes} where ${watchLikes.watchId} = ${watches.watchId} and ${watchLikes.userId} = ${viewerId})`
          : sql<boolean>`false`,
        saved: viewerId
          ? sql<boolean>`exists(select 1 from ${watchFavorites} where ${watchFavorites.watchId} = ${watches.watchId} and ${watchFavorites.userId} = ${viewerId})`
          : sql<boolean>`false`,
      })
      .from(watches)
      .where(eq(watches.watchId, watchId)),
    getCommentThreads("watch", watchId, viewerId),
  ]);
  return {
    views: stats?.views ?? 0,
    shares: stats?.shares ?? 0,
    likes: stats?.likes ?? 0,
    liked: stats?.liked ?? false,
    saved: stats?.saved ?? false,
    comments: comments.comments,
    commentCount: comments.count,
  };
}

// The viewer's saved videos, most recently saved first (Figma "Saves", Watches tab 153:15583).
export async function getSavedWatches(userId: string) {
  const rows = await selectWatch(userId)
    .innerJoin(watchFavorites, and(eq(watchFavorites.watchId, watches.watchId), eq(watchFavorites.userId, userId)))
    .where(isPublic)
    .orderBy(desc(watchFavorites.createdAt));
  return rows.map(toSummary);
}
