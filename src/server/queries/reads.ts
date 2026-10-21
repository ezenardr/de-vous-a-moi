import "server-only";
import { unstable_cache } from "next/cache";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { calculateReadingTime } from "@/lib/calculateReadingTime";
import { db } from "@/server/db";
import { favorites, readComments, reads, users } from "@/server/db/schema";
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
      createdAt: reads.createdAt,
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

const isPublic = eq(reads.archived, false);

export async function getLatestReads({ limit, viewerId }: { limit?: number; viewerId?: string } = {}) {
  const query = selectRead(viewerId).where(isPublic).orderBy(desc(reads.createdAt));
  const rows = await (limit ? query.limit(limit) : query);
  return rows.map(toSummary);
}

export async function getFeaturedReads(viewerId?: string) {
  const rows = await selectRead(viewerId)
    .where(and(isPublic, eq(reads.featured, true)))
    .orderBy(desc(reads.createdAt));
  return rows.map(toSummary);
}

export async function getMostSavedReads(limit: number) {
  const rows = await selectRead()
    .where(isPublic)
    .orderBy(desc(sql`(select count(*) from ${favorites} where ${favorites.readId} = ${reads.readId})`), desc(reads.createdAt))
    .limit(limit);
  return rows.map(toSummary);
}

export async function getReadsByCategory(category: string, viewerId?: string) {
  const rows = await selectRead(viewerId)
    .where(and(isPublic, eq(reads.category, category)))
    .orderBy(desc(reads.createdAt));
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
      .where(eq(readComments.readId, readId))
      .orderBy(desc(readComments.createdAt)),
    selectRead(viewerId)
      .where(and(isPublic, eq(reads.category, row.category), ne(reads.readId, readId)))
      .orderBy(desc(reads.createdAt))
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
    .orderBy(desc(reads.createdAt));
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
    const featured = featuredAll.slice(0, 2);
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

export const getAllReadsCached = unstable_cache(() => getLatestReads(), ["all-reads-v1"], {
  tags: [READS_TAG],
  revalidate: 300,
});
