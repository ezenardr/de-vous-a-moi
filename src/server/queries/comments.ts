import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { readComments, users, watchComments } from "@/server/db/schema";
import { toIso } from "./shared";

export type CommentKind = "read" | "watch";

// What an article or video page shows. Replies are one level deep. `mine` lets the author delete
// their own comment without ever sending user ids to the browser. A hidden comment that still has
// visible replies stays as a placeholder (empty text, hidden: true) so the thread makes sense.
export type PublicComment = {
  commentId: string;
  comment: string;
  createdAt: string;
  author: string;
  mine: boolean;
  hidden: boolean;
  replies: PublicComment[];
};

export const COMMENT_TABLES = {
  read: { table: readComments, id: readComments.readCommentId, itemId: readComments.readId },
  watch: { table: watchComments, id: watchComments.watchCommentId, itemId: watchComments.watchId },
} as const;

// "Adanna O." as in Figma: first name and last initial (also keeps commenters' full names private).
export const shortName = (first: string, last: string) => `${first} ${last ? `${last.trim()[0]}.` : ""}`.trim();

type Row = {
  commentId: string;
  parentId: string | null;
  userId: string | null;
  comment: string;
  createdAt: Date | null;
  hiddenAt: Date | null;
  firstName: string | null;
  lastName: string | null;
};

// Builds the threads: top-level comments newest first, replies oldest first (a conversation).
export function buildThreads(rows: Row[], viewerId?: string): { comments: PublicComment[]; count: number } {
  const toPublic = (r: Row): PublicComment => ({
    commentId: r.commentId,
    comment: r.hiddenAt ? "" : r.comment,
    createdAt: toIso(r.createdAt) ?? new Date(0).toISOString(),
    author: r.hiddenAt ? "" : shortName(r.firstName ?? "", r.lastName ?? ""),
    mine: !r.hiddenAt && !!viewerId && r.userId === viewerId,
    hidden: !!r.hiddenAt,
    replies: [],
  });

  const replies = new Map<string, PublicComment[]>();
  for (const r of rows) {
    if (!r.parentId || r.hiddenAt) continue;
    replies.set(r.parentId, [...(replies.get(r.parentId) ?? []), toPublic(r)]);
  }

  const comments: PublicComment[] = [];
  for (const r of [...rows].reverse()) {
    if (r.parentId) continue;
    const thread = { ...toPublic(r), replies: replies.get(r.commentId) ?? [] };
    if (thread.hidden && thread.replies.length === 0) continue;
    comments.push(thread);
  }
  const count = comments.reduce((n, c) => n + (c.hidden ? 0 : 1) + c.replies.length, 0);
  return { comments, count };
}

export async function getCommentThreads(kind: CommentKind, itemId: string, viewerId?: string) {
  const c = COMMENT_TABLES[kind];
  const rows = await db
    .select({
      commentId: c.id,
      parentId: c.table.parentId,
      userId: c.table.userId,
      comment: c.table.comment,
      createdAt: c.table.createdAt,
      hiddenAt: c.table.hiddenAt,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(c.table)
    .leftJoin(users, eq(users.userId, c.table.userId))
    .where(eq(c.itemId, itemId))
    .orderBy(asc(c.table.createdAt));
  return buildThreads(rows as Row[], viewerId);
}
