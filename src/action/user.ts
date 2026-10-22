"use server";

import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import z from "zod";
import { nameSchema } from "@/lib/validation/auth";
import { ActionError, requireUser, toActionError } from "@/server/auth/permissions";
import { db } from "@/server/db";
import { revalidatePage } from "@/server/revalidate";
import { users } from "@/server/db/schema";
import { subscribe, unsubscribeEmail } from "@/server/newsletter";
import { READS_TAG } from "@/server/queries/reads";
import { deleteImage, isUploadedImage, uploadImage } from "@/server/storage";

const fail = (error: unknown, context: string) => ({ success: false as const, ...toActionError(error, context) });

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
    revalidateTag(READS_TAG, "max"); // author names appear on cards
    revalidatePage(pathname);
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
    const { url, fileId } = await uploadImage(image, "profiles");
    await db
      .update(users)
      .set({ profileImageUrl: url, imageFileId: fileId, updatedAt: new Date() })
      .where(eq(users.userId, user.userId));
    await deleteImage(user.imageFileId);
    revalidateTag(READS_TAG, "max"); // author avatars appear on cards
    revalidatePage(pathname);
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
    // The newsletter list (newsletter_subscribers) is the one that counts; keep it in step.
    if (parsed.data.newsletter !== user.newsletter) {
      if (parsed.data.newsletter) await subscribe(user.email.toLowerCase(), user.userId);
      else await unsubscribeEmail(user.email.toLowerCase());
    }
    revalidatePage(pathname);
    return { success: true as const };
  } catch (error) {
    return fail(error, "updateUserNotificationPreferences");
  }
}

// "Recevoir la newsletter" on the About page: turns the preference on for the signed-in reader.
export async function subscribeToNewsletter() {
  try {
    const user = await requireUser();
    await subscribe(user.email.toLowerCase(), user.userId);
    return { success: true as const };
  } catch (error) {
    return fail(error, "subscribeToNewsletter");
  }
}
