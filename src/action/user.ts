"use server";

import { revalidatePath } from "next/cache";

export async function updateUserName(
  body: unknown,
  accessToken: string,
  pathname: string,
) {
  try {
    const request = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Accept-Language": "fr",
        origin: process.env.NEXT_PUBLIC_APP_URL!,
      },
      body: JSON.stringify(body),
    });
    const response = await request.json();
    if (response.success === true) {
      revalidatePath(pathname);
      return {
        success: true,
      };
    } else {
      revalidatePath(pathname);
      throw new Error(response.message);
    }
  } catch (error: unknown) {
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function uploadUserProfilePicture(
  body: FormData,
  accessToken: string,
  pathname: string,
) {
  try {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/me/profile`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Accept-Language": "fr",
          origin: process.env.NEXT_PUBLIC_APP_URL!,
        },
        body: body,
      },
    );
    const response = await request.json();
    if (response.success === true) {
      revalidatePath(pathname);
      return {
        success: true,
        profileImageUrl: response.profileImageUrl,
        imageFileId: response.imageFileId,
      };
    } else {
      revalidatePath(pathname);
      throw new Error(response.message);
    }
  } catch (error: unknown) {
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function updateUserNotificationPreferences(
  body: unknown,
  accessToken: string,
  pathname: string,
) {
  try {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/notifications`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Accept-Language": "fr",
          origin: process.env.NEXT_PUBLIC_APP_URL!,
        },
        body: JSON.stringify(body),
      },
    );
    const response = await request.json();
    if (response.success === true) {
      revalidatePath(pathname);
      return {
        success: true,
      };
    } else {
      revalidatePath(pathname);
      throw new Error(response.message);
    }
  } catch (error: unknown) {
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
