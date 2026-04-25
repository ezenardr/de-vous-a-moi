"use server";

import { slugify } from "@/lib/Slugify";
import { User, Watch } from "@/types/types";
import { revalidatePath } from "next/cache";

export async function PublishWatch({
  user,
  body,
}: {
  user: User;
  body: FormData;
}) {
  try {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/author/watch`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          "Accept-Language": "fr",
          origin: process.env.NEXT_PUBLIC_APP_URL!,
        },
        body: body,
      },
    );
    const response = await request.json();
    if (response.success === true) {
      revalidatePath(`/author/watches`);
      return {
        success: true,
        watch: response.watch,
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

export async function AddWatchComment({
  body,
  user,
  watch,
}: {
  body: unknown;
  user: User;
  watch: Watch;
}) {
  try {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/comments/watch`,
      {
        method: "POST",
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
      revalidatePath(`/reads/${slugify(watch.title, watch.watchId)}`);
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
