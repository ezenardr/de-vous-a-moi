"use server";

import { randomUUID } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import z from "zod";
import { slugify } from "@/lib/Slugify";
import { ActionError, requireAdmin, requireUser, toActionError } from "@/server/auth/permissions";
import { db } from "@/server/db";
import { readComments, reads, watchComments, watches } from "@/server/db/schema";
import { COMMENT_TABLES, type CommentKind } from "@/server/queries/comments";
import { publicRead } from "@/server/queries/reads";
import { publicWatch } from "@/server/queries/watches";

// Comments on articles and videos: post, reply (one level), delete your own; admins hide or delete any.

const fail = (error: unknown, context: string) => ({ success: false as const, ...toActionError(error, context) });
const kindSchema = z.enum(["read", "watch"]);

function parse<T>(schema: z.ZodType<T>, input: unknown, message = "Données invalides"): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new ActionError(message);
  return result.data;
}

const ITEMS = {
  read: { table: reads, id: reads.readId, isPublic: publicRead, path: "reads", missing: "Article introuvable" },
  watch: { table: watches, id: watches.watchId, isPublic: publicWatch, path: "watches", missing: "Vidéo introuvable" },
} as const;

async function findPublicItem(kind: CommentKind, itemId: string) {
  const item = ITEMS[kind];
  const [row] = await db.select({ id: item.id, title: item.table.title }).from(item.table).where(and(eq(item.id, itemId), item.isPublic)).limit(1);
  if (!row) throw new ActionError(item.missing);
  return row;
}

// The public page of the item a comment belongs to, so it re-renders with the change.
async function refreshItem(kind: CommentKind, itemId: string | null) {
  if (itemId) {
    const item = ITEMS[kind];
    const [row] = await db.select({ title: item.table.title }).from(item.table).where(eq(item.id, itemId)).limit(1);
    if (row) revalidatePath(`/${item.path}/${slugify(row.title, itemId)}`);
  }
  revalidatePath("/admin", "layout");
}

async function findComment(kind: CommentKind, commentId: string) {
  const c = COMMENT_TABLES[kind];
  const [row] = await db
    .select({ id: c.id, itemId: c.itemId, userId: c.table.userId, parentId: c.table.parentId, hiddenAt: c.table.hiddenAt })
    .from(c.table)
    .where(eq(c.id, commentId))
    .limit(1);
  if (!row) throw new ActionError("Commentaire introuvable");
  return row;
}

const postSchema = z.object({
  kind: kindSchema,
  itemId: z.uuid(),
  comment: z.string().trim().min(3).max(500),
  parentId: z.uuid().optional(),
});

// A new comment, or a reply to a visible top-level comment on the same item.
export async function PostComment(input: { kind: CommentKind; itemId: string; comment: string; parentId?: string }) {
  try {
    const user = await requireUser();
    const { kind, itemId, comment, parentId } = parse(postSchema, input, "Le commentaire doit contenir entre 3 et 500 caractères.");
    const item = await findPublicItem(kind, itemId);
    if (parentId) {
      const parent = await findComment(kind, parentId);
      if (parent.itemId !== itemId || parent.parentId || parent.hiddenAt) throw new ActionError("Impossible de répondre à ce commentaire.");
    }
    const commentId = randomUUID();
    const now = new Date();
    const values = { userId: user.userId, comment, parentId: parentId ?? null, createdAt: now, updatedAt: now };
    if (kind === "read") await db.insert(readComments).values({ ...values, readCommentId: commentId, readId: itemId });
    else await db.insert(watchComments).values({ ...values, watchCommentId: commentId, watchId: itemId });
    revalidatePath(`/${ITEMS[kind].path}/${slugify(item.title, item.id)}`);
    revalidatePath("/admin", "layout");
    return { success: true as const, commentId };
  } catch (error) {
    return fail(error, "PostComment");
  }
}

const refSchema = z.object({ kind: kindSchema, commentId: z.uuid() });

// The author deletes their own comment (its replies go with it).
export async function DeleteOwnComment(input: { kind: CommentKind; commentId: string }) {
  try {
    const user = await requireUser();
    const { kind, commentId } = parse(refSchema, input);
    const c = COMMENT_TABLES[kind];
    const deleted = await db
      .delete(c.table)
      .where(and(eq(c.id, commentId), eq(c.table.userId, user.userId), isNull(c.table.hiddenAt)))
      .returning({ itemId: c.itemId });
    if (deleted.length === 0) throw new ActionError("Commentaire introuvable");
    await refreshItem(kind, deleted[0].itemId);
    return { success: true as const };
  } catch (error) {
    return fail(error, "DeleteOwnComment");
  }
}

// Moderation: hide (kept, out of sight) or show again.
export async function SetCommentHidden(input: { kind: CommentKind; commentId: string; hidden: boolean }) {
  try {
    const admin = await requireAdmin();
    const { kind, commentId, hidden } = parse(refSchema.extend({ hidden: z.boolean() }), input);
    const c = COMMENT_TABLES[kind];
    const updated = await db
      .update(c.table)
      .set(hidden ? { hiddenAt: new Date(), hiddenBy: admin.userId } : { hiddenAt: null, hiddenBy: null })
      .where(eq(c.id, commentId))
      .returning({ itemId: c.itemId });
    if (updated.length === 0) throw new ActionError("Commentaire introuvable");
    await refreshItem(kind, updated[0].itemId);
    return { success: true as const };
  } catch (error) {
    return fail(error, "SetCommentHidden");
  }
}

// Moderation: delete for good (replies included).
export async function AdminDeleteComment(input: { kind: CommentKind; commentId: string }) {
  try {
    await requireAdmin();
    const { kind, commentId } = parse(refSchema, input);
    const c = COMMENT_TABLES[kind];
    const deleted = await db.delete(c.table).where(eq(c.id, commentId)).returning({ itemId: c.itemId });
    if (deleted.length === 0) throw new ActionError("Commentaire introuvable");
    await refreshItem(kind, deleted[0].itemId);
    return { success: true as const };
  } catch (error) {
    return fail(error, "AdminDeleteComment");
  }
}
