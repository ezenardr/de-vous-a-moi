"use server";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import z from "zod";
import { slugify } from "@/lib/Slugify";
import { ActionError, requireAuthor, requireUser, toActionError } from "@/server/auth/permissions";
import { db } from "@/server/db";
import { watchComments, watches } from "@/server/db/schema";
import { deleteImage, isUploadedImage, uploadImage } from "@/server/storage";

const fail = (error: unknown, context: string) => ({ success: false as const, ...toActionError(error, context) });

const watchFields = z.object({
  title: z.string().trim().min(1, "Titre requis").max(255),
  description: z.string().trim().min(1, "Description requise").max(255),
  videoUrl: z.url("Lien vidéo invalide").max(2048),
});
const commentSchema = z.object({ watchId: z.uuid(), comment: z.string().trim().min(3).max(500) });

export async function PublishWatch({ body }: { body: FormData }) {
  try {
    const user = await requireAuthor();
    const parsed = watchFields.safeParse({
      title: body.get("title"),
      description: body.get("description"),
      videoUrl: body.get("videoUrl"),
    });
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message ?? "Données invalides");
    const image = body.get("image");
    if (!isUploadedImage(image)) throw new ActionError("Image requise");

    const cover = await uploadImage(image, parsed.data.title);
    const now = new Date();
    try {
      const [watch] = await db
        .insert(watches)
        .values({
          watchId: randomUUID(),
          userId: user.userId,
          ...parsed.data,
          category: "Le Spotlight",
          imageUrl: cover.url,
          imageFileId: cover.fileId,
          featured: false,
          archived: false,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      revalidatePath(`/author/watches`);
      revalidatePath(`/watches`);
      return { success: true as const, watch };
    } catch (error) {
      await deleteImage(cover.fileId); // don't leave an orphaned image behind
      throw error;
    }
  } catch (error) {
    return fail(error, "PublishWatch");
  }
}

export async function AddWatchComment({ body }: { body: { watchId: string; comment: string } }) {
  try {
    const user = await requireUser();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) throw new ActionError("Le commentaire doit contenir entre 3 et 500 caractères.");
    const { watchId, comment } = parsed.data;
    const [watch] = await db
      .select({ watchId: watches.watchId, title: watches.title })
      .from(watches)
      .where(and(eq(watches.watchId, watchId), eq(watches.archived, false)))
      .limit(1);
    if (!watch) throw new ActionError("Vidéo introuvable");
    const now = new Date();
    await db.insert(watchComments).values({
      watchCommentId: randomUUID(),
      watchId,
      userId: user.userId,
      comment,
      createdAt: now,
      updatedAt: now,
    });
    revalidatePath(`/watches/${slugify(watch.title, watch.watchId)}`);
    return { success: true as const };
  } catch (error) {
    return fail(error, "AddWatchComment");
  }
}
