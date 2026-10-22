import "server-only";
import { unstable_cache } from "next/cache";
import { and, desc, eq, isNull, lte, ne, or, sql } from "drizzle-orm";
import { calculateReadingTime } from "@/lib/calculateReadingTime";
import { MAX_FEATURED } from "@/lib/featured";
import { db } from "@/server/db";
import { favorites, readComments, readLikes, reads, users } from "@/server/db/schema";
import { prepareArticle, type TocEntry } from "@/server/content/article";
import { getCommentThreads, type PublicComment } from "./comments";
import { publicAuthor, toIso, type PublicAuthor } from "./shared";

export type ReadSummary = {
  readId: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  featured: boolean;
  readingTime: number;
  favoriteCount: number;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string | null;
  user: PublicAuthor;
};

export type ReadComment = {
  readCommentId: string;
  comment: string;
  createdAt: string;
  user: PublicAuthor;
};

export type ReadDetail = ReadSummary & { content: string; comments: ReadComment[] };

// Only published, non-archived reads are public. `viewerId` drives `isSaved`;
// no other user's identifiers are ever returned.
// Public = not archived and already published (published_at, migration 0005, may schedule it for later;
// null means public since created_at). Shared with the actions so likes, comments and views agree.
export const publicRead = and(eq(reads.archived, false), or(isNull(reads.publishedAt), lte(reads.publishedAt, sql`now()`)))!;
const isPublic = publicRead;
// The date readers see and lists sort by: the publication date.
const readDate = sql<Date>`coalesce(${reads.publishedAt}, ${reads.createdAt})`.mapWith(reads.createdAt);

function selectRead(viewerId?: string) {
  return db
    .select({
      readId: reads.readId,
      title: reads.title,
      description: reads.description,
      imageUrl: reads.imageUrl,
      category: reads.category,
      featured: reads.featured,
      content: reads.content,
      createdAt: readDate,
      updatedAt: reads.updatedAt,
      favoriteCount: sql<number>`(select count(*) from ${favorites} where ${favorites.readId} = ${reads.readId})`.mapWith(Number),
      isSaved: viewerId
        ? sql<boolean>`exists(select 1 from ${favorites} where ${favorites.readId} = ${reads.readId} and ${favorites.userId} = ${viewerId})`
        : sql<boolean>`false`,
      user: publicAuthor,
    })
    .from(reads)
    .leftJoin(users, eq(users.userId, reads.userId))
    .$dynamic();
}

type ReadRow = Awaited<ReturnType<ReturnType<typeof selectRead>["execute"]>>[number];

function toSummary({ content, createdAt, updatedAt, featured, user, ...row }: ReadRow): ReadSummary {
  return {
    ...row,
    featured: featured ?? false,
    readingTime: calculateReadingTime(content),
    createdAt: toIso(createdAt)!,
    updatedAt: toIso(updatedAt),
    user: user ?? { firstName: "", lastName: "", profileImageUrl: null },
  };
}


export async function getLatestReads({ limit, viewerId }: { limit?: number; viewerId?: string } = {}) {
  const query = selectRead(viewerId).where(isPublic).orderBy(desc(readDate));
  const rows = await (limit ? query.limit(limit) : query);
  return rows.map(toSummary);
}

export async function getFeaturedReads(viewerId?: string) {
  const rows = await selectRead(viewerId)
    .where(and(isPublic, eq(reads.featured, true)))
    .orderBy(desc(readDate));
  return rows.map(toSummary);
}

export async function getMostSavedReads(limit: number) {
  const rows = await selectRead()
    .where(isPublic)
    .orderBy(desc(sql`(select count(*) from ${favorites} where ${favorites.readId} = ${reads.readId})`), desc(readDate))
    .limit(limit);
  return rows.map(toSummary);
}

export async function getReadsByCategory(category: string, viewerId?: string) {
  const rows = await selectRead(viewerId)
    .where(and(isPublic, eq(reads.category, category)))
    .orderBy(desc(readDate));
  return rows.map(toSummary);
}

export async function getReadWithRelated(readId: string, viewerId?: string) {
  const [row] = await selectRead(viewerId)
    .where(and(isPublic, eq(reads.readId, readId)))
    .limit(1);
  if (!row) return null;

  const [comments, related] = await Promise.all([
    db
      .select({
        readCommentId: readComments.readCommentId,
        comment: readComments.comment,
        createdAt: readComments.createdAt,
        user: publicAuthor,
      })
      .from(readComments)
      .leftJoin(users, eq(users.userId, readComments.userId))
      .where(and(eq(readComments.readId, readId), isNull(readComments.hiddenAt)))
      .orderBy(desc(readComments.createdAt)),
    selectRead(viewerId)
      .where(and(isPublic, eq(reads.category, row.category), ne(reads.readId, readId)))
      .orderBy(desc(readDate))
      .limit(6),
  ]);

  const read: ReadDetail = {
    ...toSummary(row),
    content: row.content,
    comments: comments.map(({ createdAt, user, ...comment }) => ({
      ...comment,
      createdAt: toIso(createdAt)!,
      user: user ?? { firstName: "", lastName: "", profileImageUrl: null },
    })),
  };
  return { read, related: related.map(toSummary) };
}

export async function getCategories() {
  return db
    .select({ category: reads.category, total: sql<number>`count(*)`.mapWith(Number) })
    .from(reads)
    .where(isPublic)
    .groupBy(reads.category)
    .orderBy(desc(sql`count(*)`));
}

export async function getSavedReads(userId: string) {
  const rows = await selectRead(userId)
    .innerJoin(favorites, and(eq(favorites.readId, reads.readId), eq(favorites.userId, userId)))
    .where(isPublic)
    .orderBy(desc(favorites.createdAt));
  return rows.map(toSummary);
}

export async function getSitemapReads() {
  return db
    .select({ readId: reads.readId, title: reads.title, createdAt: reads.createdAt, updatedAt: reads.updatedAt })
    .from(reads)
    .where(isPublic)
    .orderBy(desc(readDate));
}

// ---------------------------------------------------------------------------------------------
// Cached public data. Cached results never depend on the visitor; the visitor's saved state
// is merged in per request (one small indexed query, and only when logged in).
// Invalidated with revalidateTag(READS_TAG, …) by actions that change what's shown.
export const READS_TAG = "reads";

// Home (Figma 153:13775): two featured reads, the 6 latest others, then 5 "you might like"
// (the most-saved reads not already shown; newest first on ties).
export const getHomeReads = unstable_cache(
  async () => {
    const [featuredAll, recent, popular] = await Promise.all([
      getFeaturedReads(),
      getLatestReads({ limit: 8 }),
      getMostSavedReads(15),
    ]);
    // Fewer than two flagged (one unflagged or archived): the newest reads fill the free slots.
    const featured = featuredAll.slice(0, MAX_FEATURED);
    for (const read of recent) if (featured.length < MAX_FEATURED && !featured.some((f) => f.readId === read.readId)) featured.push(read);
    const shown = new Set(featured.map((read) => read.readId));
    const latest = recent.filter((read) => !shown.has(read.readId)).slice(0, 6);
    latest.forEach((read) => shown.add(read.readId));
    const mightLike = popular.filter((read) => !shown.has(read.readId)).slice(0, 5);
    return { featured, latest, mightLike };
  },
  ["home-reads-v2"],
  { tags: [READS_TAG], revalidate: 300 },
);

export async function getSavedReadIds(userId: string | undefined): Promise<Set<string>> {
  if (!userId) return new Set();
  const rows = await db.select({ readId: favorites.readId }).from(favorites).where(eq(favorites.userId, userId));
  return new Set(rows.map((row) => row.readId!));
}

export const markSaved = (list: ReadSummary[], saved: Set<string>) =>
  list.map((read) => ({ ...read, isSaved: saved.has(read.readId) }));

// Categories (Figma 153:14934): every category with public reads, biggest first.
export const getCategoriesCached = unstable_cache(() => getCategories(), ["categories-v1"], {
  tags: [READS_TAG],
  revalidate: 300,
});

// One category's reads, newest first (Figma 153:15026). Empty means the category doesn't exist.
export function getCategoryReads(category: string): Promise<ReadSummary[]> {
  return unstable_cache(() => getReadsByCategory(category), ["category-reads-v1", category], {
    tags: [READS_TAG],
    revalidate: 300,
  })();
}

export const getAllReadsCached = unstable_cache(() => getLatestReads(), ["all-reads-v1"], {
  tags: [READS_TAG],
  revalidate: 300,
});

// ---------------------------------------------------------------------------------------------
// Article page (Figma "Read open"). The article itself is cached per read; engagement (counts,
// the viewer's like/save, comments) is read fresh on every request.
export const articleTag = (readId: string) => `read:${readId}`;

export type ArticleData = {
  read: ReadSummary & { html: string; toc: TocEntry[] };
  related: { readId: string; title: string }[];
  recommended: ReadSummary[];
};

export function getArticle(readId: string): Promise<ArticleData | null> {
  return unstable_cache(
    async (): Promise<ArticleData | null> => {
      const [row] = await selectRead().where(and(isPublic, eq(reads.readId, readId))).limit(1);
      if (!row) return null;
      const sameCategory = await selectRead()
        .where(and(isPublic, eq(reads.category, row.category), ne(reads.readId, readId)))
        .orderBy(desc(readDate))
        .limit(6);
      const related = sameCategory.slice(0, 3).map(({ readId, title }) => ({ readId, title }));
      const recommended = sameCategory.slice(3).map(toSummary);
      if (recommended.length < 3) {
        const seen = new Set([readId, ...sameCategory.map((r) => r.readId)]);
        const popular = await getMostSavedReads(12);
        recommended.push(...popular.filter((r) => !seen.has(r.readId)).slice(0, 3 - recommended.length));
      }
      return { read: { ...toSummary(row), ...prepareArticle(row.content) }, related, recommended };
    },
    ["article-v2", readId], // v2: inline images go through the image optimizer
    { tags: [READS_TAG, articleTag(readId)], revalidate: 300 },
  )();
}

export type ArticleEngagement = {
  views: number;
  shares: number;
  likes: number;
  liked: boolean;
  saved: boolean;
  comments: PublicComment[];
  commentCount: number;
};

export async function getArticleEngagement(readId: string, viewerId?: string): Promise<ArticleEngagement> {
  const [[stats], comments] = await Promise.all([
    db
      .select({
        views: reads.viewCount,
        shares: reads.shareCount,
        likes: sql<number>`(select count(*) from ${readLikes} where ${readLikes.readId} = ${reads.readId})`.mapWith(Number),
        liked: viewerId
          ? sql<boolean>`exists(select 1 from ${readLikes} where ${readLikes.readId} = ${reads.readId} and ${readLikes.userId} = ${viewerId})`
          : sql<boolean>`false`,
        saved: viewerId
          ? sql<boolean>`exists(select 1 from ${favorites} where ${favorites.readId} = ${reads.readId} and ${favorites.userId} = ${viewerId})`
          : sql<boolean>`false`,
      })
      .from(reads)
      .where(eq(reads.readId, readId)),
    getCommentThreads("read", readId, viewerId),
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

// Simple accent- and case-insensitive search over the cached list of public reads (29 today).
// Full-text search comes with the search feature; this keeps the header search working meanwhile.
const fold = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export async function searchReads(query: string) {
  const terms = fold(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const all = await getAllReadsCached();
  return all.filter((read) => {
    const haystack = fold(`${read.title} ${read.description} ${read.category} ${read.user.firstName} ${read.user.lastName}`);
    return terms.every((term) => haystack.includes(term));
  });
}
