import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { users, watchComments, watchFavorites, watches } from "@/server/db/schema";
import { publicAuthor, toIso, type PublicAuthor } from "./shared";

export type WatchSummary = {
  watchId: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  videoUrl: string;
  featured: boolean;
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
      createdAt: watches.createdAt,
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

const isPublic = eq(watches.archived, false);

export async function getLatestWatches({ limit, viewerId }: { limit?: number; viewerId?: string } = {}) {
  const query = selectWatch(viewerId).where(isPublic).orderBy(desc(watches.createdAt));
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
    .where(eq(watchComments.watchId, watchId))
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
    .orderBy(desc(watches.createdAt));
}
