"use server";

import { randomUUID } from "node:crypto";
import { and, count, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import z from "zod";
import { slugify } from "@/lib/Slugify";
import { requireAdmin, requireAuthor, requireUser, toActionError, ActionError } from "@/server/auth/permissions";
import { db } from "@/server/db";
import { favorites, readComments, readDrafts, reads } from "@/server/db/schema";
import { READS_TAG } from "@/server/queries/reads";
import { getOwnDraft, getOwnRead } from "@/server/queries/studio";
import { deleteImage, isUploadedImage, uploadImage } from "@/server/storage";

const MAX_FEATURED = 3;
const fail = (error: unknown, context: string) => ({ success: false as const, ...toActionError(error, context) });

// title and description are varchar(255) in the database.
const optionalText = (max: number) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() !== "" ? v : null), z.string().max(max).nullable());
const draftFields = z.object({
  title: optionalText(255),
  description: optionalText(255),
  category: optionalText(100),
  content: optionalText(1_000_000),
});
const readFields = z.object({
  title: z.string().trim().min(1, "Titre requis").max(255),
  description: z.string().trim().min(1, "Description requise").max(255),
  category: z.string().trim().min(1, "Catégorie requise").max(100),
  content: z.string().min(1, "Contenu requis").max(1_000_000),
});
const commentSchema = z.object({ readId: z.uuid(), comment: z.string().trim().min(3).max(500) });

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new ActionError(result.error.issues[0]?.message ?? "Données invalides");
  return result.data;
}

async function findPublicRead(readId: string) {
  const [read] = await db
    .select({ readId: reads.readId, title: reads.title })
    .from(reads)
    .where(and(eq(reads.readId, readId), eq(reads.archived, false)))
    .limit(1);
  if (!read) throw new ActionError("Article introuvable");
  return read;
}

export async function CreateDraft() {
  try {
    const user = await requireAuthor();
    const now = new Date();
    const [draft] = await db
      .insert(readDrafts)
      .values({ readDraftId: randomUUID(), userId: user.userId, createdAt: now, updatedAt: now })
      .returning({ readDraftId: readDrafts.readDraftId });
    revalidatePath("/author/reads");
    return { success: true as const, read: draft };
  } catch (error) {
    return fail(error, "CreateDraft");
  }
}

export async function SaveDraft({ readDraftId, body }: { readDraftId: string; body: FormData }) {
  try {
    const user = await requireAuthor();
    const draft = await getOwnDraft(readDraftId, user.userId);
    if (!draft) throw new ActionError("Article introuvable");
    const fields = parse(draftFields, Object.fromEntries(["title", "description", "category", "content"].map((k) => [k, body.get(k)])));

    // Only a newly chosen image replaces the cover; the existing one is kept otherwise.
    const image = body.get("image");
    const cover = isUploadedImage(image) ? await uploadImage(image, readDraftId) : null;
    const [updated] = await db
      .update(readDrafts)
      .set({
        ...fields,
        ...(cover ? { imageUrl: cover.url, imageFileId: cover.fileId } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(readDrafts.readDraftId, readDraftId), eq(readDrafts.userId, user.userId)))
      .returning();
    if (cover) await deleteImage(draft.imageFileId);

    revalidatePath(`/author/reads/draft/${readDraftId}`);
    return { success: true as const, draft: updated };
  } catch (error) {
    return fail(error, "SaveDraft");
  }
}

export async function UploadInlineImage(body: FormData) {
  try {
    const user = await requireAuthor();
    const file = body.get("file");
    if (!isUploadedImage(file)) throw new ActionError("Aucune image fournie");
    // The userId prefix makes orphaned inline images traceable, as in the API.
    const { url, fileId } = await uploadImage(file, `inline_${user.userId}_${Date.now()}`);
    return { success: true as const, url, fileId };
  } catch (error) {
    return fail(error, "UploadInlineImage");
  }
}

export async function DeleteDraft({ readDraftId }: { readDraftId: string }) {
  try {
    const user = await requireAuthor();
    const draft = await getOwnDraft(readDraftId, user.userId);
    if (!draft) throw new ActionError("Article introuvable");
    await db.delete(readDrafts).where(and(eq(readDrafts.readDraftId, readDraftId), eq(readDrafts.userId, user.userId)));
    await deleteImage(draft.imageFileId);
    revalidatePath(`/author/reads`);
    return { success: true as const };
  } catch (error) {
    return fail(error, "DeleteDraft");
  }
}

export async function PublishRead({ readDraftId }: { readDraftId: string }) {
  try {
    const user = await requireAuthor();
    const draft = await getOwnDraft(readDraftId, user.userId);
    if (!draft) throw new ActionError("Article introuvable");
    // The API copied possibly-null draft fields into NOT NULL columns and failed with a raw DB error.
    const fields = readFields.safeParse(draft);
    if (!fields.success || !draft.imageUrl || !draft.imageFileId) {
      throw new ActionError("Veuillez compléter le titre, la description, la catégorie, le contenu et l'image avant de publier.");
    }
    const now = new Date();
    const readId = randomUUID();
    await db.transaction(async (tx) => {
      await tx.insert(reads).values({
        readId,
        userId: user.userId,
        ...fields.data,
        imageUrl: draft.imageUrl!,
        imageFileId: draft.imageFileId!,
        featured: false,
        archived: false,
        createdAt: now,
        updatedAt: now,
      });
      await tx.delete(readDrafts).where(eq(readDrafts.readDraftId, readDraftId));
    });
    revalidateTag(READS_TAG, { expire: 0 });
    revalidatePath(`/`);
    revalidatePath(`/categories`);
    revalidatePath(`/author/reads`);
    return { success: true as const, readId };
  } catch (error) {
    return fail(error, "PublishRead");
  }
}

export async function SaveRead({
  readId,
  title,
  description,
  category,
  content,
  imageBase64,
  imageType,
}: {
  readId: string;
  title: string;
  description: string;
  category: string;
  content: string;
  imageBase64: string | null;
  imageType: string | null;
}) {
  try {
    const user = await requireAuthor();
    const read = await getOwnRead(readId, user.userId);
    if (!read) throw new ActionError("Article introuvable");
    const fields = parse(readFields, { title, description, category, content });

    const cover =
      imageBase64 && imageType
        ? await uploadImage(new File([Buffer.from(imageBase64, "base64")], "image", { type: imageType }), readId)
        : null;
    const [updated] = await db
      .update(reads)
      .set({ ...fields, ...(cover ? { imageUrl: cover.url, imageFileId: cover.fileId } : {}), updatedAt: new Date() })
      .where(and(eq(reads.readId, readId), eq(reads.userId, user.userId)))
      .returning();
    if (cover) await deleteImage(read.imageFileId);

    revalidateTag(READS_TAG, { expire: 0 });
    revalidatePath(`/author/reads/${readId}`);
    revalidatePath(`/author/reads`);
    revalidatePath(`/reads/${slugify(updated.title, readId)}`);
    return { success: true as const, draft: updated };
  } catch (error) {
    return fail(error, "SaveRead");
  }
}

export async function AddReadComment({ body }: { body: { readId: string; comment: string } }) {
  try {
    const user = await requireUser();
    const { readId, comment } = parse(commentSchema, body);
    const read = await findPublicRead(readId);
    const now = new Date();
    await db.insert(readComments).values({
      readCommentId: randomUUID(),
      readId,
      userId: user.userId,
      comment,
      createdAt: now,
      updatedAt: now,
    });
    revalidatePath(`/reads/${slugify(read.title, read.readId)}`);
    return { success: true as const };
  } catch (error) {
    return fail(error, "AddReadComment");
  }
}

export async function AddReadToFavorite({ read, pathname }: { read: { readId: string }; pathname: string }) {
  try {
    const user = await requireUser();
    const { readId } = await findPublicRead(parse(z.uuid(), read.readId));
    const now = new Date();
    // Saving twice is a no-op instead of a unique-constraint error.
    await db
      .insert(favorites)
      .values({ favoriteId: randomUUID(), userId: user.userId, readId, createdAt: now, updatedAt: now })
      .onConflictDoNothing({ target: [favorites.userId, favorites.readId] });
    revalidatePath(pathname);
    return { success: true as const };
  } catch (error) {
    return fail(error, "AddReadToFavorite");
  }
}

export async function RemoveReadToFavorite({ read, pathname }: { read: { readId: string }; pathname: string }) {
  try {
    const user = await requireUser();
    const readId = parse(z.uuid(), read.readId);
    await db.delete(favorites).where(and(eq(favorites.userId, user.userId), eq(favorites.readId, readId)));
    revalidatePath(pathname);
    return { success: true as const };
  } catch (error) {
    return fail(error, "RemoveReadToFavorite");
  }
}

export async function SetFeatured({ read, featured }: { read: { readId: string }; featured: boolean }) {
  try {
    await requireAdmin();
    const readId = parse(z.uuid(), read.readId);
    if (featured) {
      const [{ total }] = await db.select({ total: count() }).from(reads).where(eq(reads.featured, true));
      if (total >= MAX_FEATURED) throw new ActionError("Vous avez atteint le maximum d'articles en vedette");
    }
    const updated = await db.update(reads).set({ featured }).where(eq(reads.readId, readId)).returning({ readId: reads.readId });
    if (updated.length === 0) throw new ActionError("Article introuvable");
    revalidateTag(READS_TAG, { expire: 0 });
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true as const };
  } catch (error) {
    return fail(error, "SetFeatured");
  }
}
