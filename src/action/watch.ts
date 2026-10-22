"use server";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import z from "zod";
import { publishAtSchema } from "@/lib/schedule";
import { fetchYoutubeDuration, youtubeId } from "@/lib/youtube";
import { ActionError, requireAuthor, requireUser, toActionError } from "@/server/auth/permissions";
import { db } from "@/server/db";
import { watchFavorites, watches } from "@/server/db/schema";
import { WATCHES_TAG, publicWatch } from "@/server/queries/watches";
import { deleteImage, isUploadedImage, uploadImage } from "@/server/storage";

const fail = (error: unknown, context: string) => ({ success: false as const, ...toActionError(error, context) });

const watchFields = z.object({
  title: z.string().trim().min(1, "Titre requis").max(255),
  description: z.string().trim().min(1, "Description requise").max(255),
  // Only YouTube: the player and the duration lookup depend on it.
  videoUrl: z.url("Lien vidéo invalide").max(2048).refine((url) => youtubeId(url) !== null, "Collez un lien YouTube (youtube.com ou youtu.be)."),
});

export async function PublishWatch({ body }: { body: FormData }) {
  try {
    const user = await requireAuthor();
    const parsed = watchFields.safeParse({
      title: body.get("title"),
      description: body.get("description"),
      videoUrl: body.get("videoUrl"),
    });
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message ?? "Données invalides");
    // A future publishAt schedules the video (hidden until then, see publicWatch).
    const schedule = publishAtSchema.safeParse(body.get("publishAt") || undefined);
    if (!schedule.success) throw new ActionError(schedule.error.issues[0]?.message ?? "Date invalide");
    const image = body.get("image");
    if (!isUploadedImage(image)) throw new ActionError("Image requise");

    const [cover, durationSeconds] = await Promise.all([
      uploadImage(image, parsed.data.title),
      fetchYoutubeDuration(parsed.data.videoUrl),
    ]);
    const now = new Date();
    try {
      const [watch] = await db
        .insert(watches)
        .values({
          watchId: randomUUID(),
          userId: user.userId,
          ...parsed.data,
          durationSeconds,
          category: "Le Spotlight",
          imageUrl: cover.url,
          imageFileId: cover.fileId,
          featured: false,
          archived: false,
          createdAt: now,
          updatedAt: now,
          publishedAt: schedule.data ?? now,
        })
        .returning();
      revalidateTag(WATCHES_TAG, { expire: 0 });
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

async function findPublicWatch(watchId: unknown) {
  const parsed = z.uuid().safeParse(watchId);
  if (!parsed.success) throw new ActionError("Vidéo introuvable");
  const [watch] = await db
    .select({ watchId: watches.watchId })
    .from(watches)
    .where(and(eq(watches.watchId, parsed.data), publicWatch))
    .limit(1);
  if (!watch) throw new ActionError("Vidéo introuvable");
  return watch;
}

export async function AddWatchToFavorite({ watch, pathname }: { watch: { watchId: string }; pathname: string }) {
  try {
    const user = await requireUser();
    const { watchId } = await findPublicWatch(watch.watchId);
    const now = new Date();
    // Saving twice is a no-op instead of a unique-constraint error.
    await db
      .insert(watchFavorites)
      .values({ watchFavoriteId: randomUUID(), userId: user.userId, watchId, createdAt: now, updatedAt: now })
      .onConflictDoNothing({ target: [watchFavorites.userId, watchFavorites.watchId] });
    revalidatePath(pathname);
    return { success: true as const };
  } catch (error) {
    return fail(error, "AddWatchToFavorite");
  }
}

export async function RemoveWatchToFavorite({ watch, pathname }: { watch: { watchId: string }; pathname: string }) {
  try {
    const user = await requireUser();
    const parsed = z.uuid().safeParse(watch.watchId);
    if (!parsed.success) throw new ActionError("Vidéo introuvable");
    await db.delete(watchFavorites).where(and(eq(watchFavorites.userId, user.userId), eq(watchFavorites.watchId, parsed.data)));
    revalidatePath(pathname);
    return { success: true as const };
  } catch (error) {
    return fail(error, "RemoveWatchToFavorite");
  }
}

// A scheduled video: move its date, or publish it now (publishAt omitted).
export async function RescheduleWatch({ watchId, publishAt }: { watchId: string; publishAt?: string }) {
  try {
    const user = await requireAuthor();
    const parsedId = z.uuid().safeParse(watchId);
    if (!parsedId.success) throw new ActionError("Vidéo introuvable");
    const [watch] = await db
      .select({ publishedAt: watches.publishedAt })
      .from(watches)
      .where(and(eq(watches.watchId, parsedId.data), eq(watches.userId, user.userId)))
      .limit(1);
    if (!watch) throw new ActionError("Vidéo introuvable");
    if (!watch.publishedAt || watch.publishedAt.getTime() <= Date.now()) throw new ActionError("Cette vidéo est déjà publiée.");
    const when = publishAtSchema.safeParse(publishAt);
    if (!when.success) throw new ActionError(when.error.issues[0]?.message ?? "Date invalide");
    await db
      .update(watches)
      .set({ publishedAt: when.data ?? new Date(), updatedAt: new Date() })
      .where(and(eq(watches.watchId, parsedId.data), eq(watches.userId, user.userId)));
    revalidateTag(WATCHES_TAG, { expire: 0 });
    revalidatePath(`/author/watches`);
    revalidatePath(`/author/watches/${parsedId.data}`);
    return { success: true as const };
  } catch (error) {
    return fail(error, "RescheduleWatch");
  }
}
