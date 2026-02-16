"use server";

import { User } from "@/types/types";
import { revalidatePath } from "next/cache";

export async function SaveDraft({
  readDraftId,
  user,
  body,
}: {
  readDraftId: string;
  user: User;
  body: unknown;
}) {
  try {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reads/drafts/${readDraftId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
          "Accept-Language": "fr",
          origin: process.env.NEXT_PUBLIC_APP_URL!,
        },
        body: JSON.stringify(body),
      },
    );
    const response = await request.json();
    if (response.success === true) {
      revalidatePath(`/author/reads/drafts/${readDraftId}`);
      return {
        success: true,
      };
    } else {
      throw new Error(response.message);
    }
  } catch (error: unknown) {
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
