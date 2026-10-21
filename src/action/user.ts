"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import z from "zod";
import { ActionError, requireUser, toActionError } from "@/server/auth/permissions";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { deleteImage, isUploadedImage, uploadImage } from "@/server/storage";

const fail = (error: unknown, context: string) => ({ success: false as const, ...toActionError(error, context) });

const nameSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(100),
  lastName: z.string().trim().min(1, "Nom requis").max(100),
});
const preferencesSchema = z.object({
  newRead: z.boolean(),
  newWatch: z.boolean(),
  newsletter: z.boolean(),
  accountActivity: z.boolean(),
});

export async function updateUserName(body: unknown, pathname: string) {
  try {
    const user = await requireUser();
    const parsed = nameSchema.safeParse(body);
    if (!parsed.success) throw new ActionError(parsed.error.issues[0]?.message ?? "Données invalides");
    await db.update(users).set({ ...parsed.data, updatedAt: new Date() }).where(eq(users.userId, user.userId));
    revalidatePath(pathname);
    return { success: true as const };
  } catch (error) {
    return fail(error, "updateUserName");
  }
}

export async function uploadUserProfilePicture(body: FormData, pathname: string) {
  try {
    const user = await requireUser();
    const image = body.get("image");
    if (!isUploadedImage(image)) throw new ActionError("Aucune image fournie");
    const { url, fileId } = await uploadImage(image, user.userId);
    await db
      .update(users)
      .set({ profileImageUrl: url, imageFileId: fileId, updatedAt: new Date() })
      .where(eq(users.userId, user.userId));
    await deleteImage(user.imageFileId);
    revalidatePath(pathname);
    return { success: true as const, profileImageUrl: url, imageFileId: fileId };
  } catch (error) {
    return fail(error, "uploadUserProfilePicture");
  }
}

export async function updateUserNotificationPreferences(body: unknown, pathname: string) {
  try {
    const user = await requireUser();
    const parsed = preferencesSchema.safeParse(body);
    if (!parsed.success) throw new ActionError("Préférences invalides");
    await db.update(users).set({ ...parsed.data, updatedAt: new Date() }).where(eq(users.userId, user.userId));
    revalidatePath(pathname);
    return { success: true as const };
  } catch (error) {
    return fail(error, "updateUserNotificationPreferences");
  }
}
