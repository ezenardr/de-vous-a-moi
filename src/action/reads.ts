"use server";

import Slugify from "@/lib/Slugify";
import { Read, User } from "@/types/types";
import { revalidatePath } from "next/cache";

export async function SaveDraft({
  readDraftId,
  user,
  body,
}: {
  readDraftId: string;
  user: User;
  body: FormData;
}) {
  try {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reads/drafts/${readDraftId}`,
      {
        method: "PUT",
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
      revalidatePath(`/author/reads/drafts/${readDraftId}`);
      return {
        success: true,
        draft: response.draft,
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

export async function DeleteDraft({
  readDraftId,
  user,
}: {
  readDraftId: string;
  user: User;
}) {
  try {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reads/drafts/${readDraftId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
          "Accept-Language": "fr",
          origin: process.env.NEXT_PUBLIC_APP_URL!,
        },
      },
    );
    const response = await request.json();
    if (response.success === true) {
      revalidatePath(`/author/reads`);
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

export async function PublishRead({
  readDraftId,
  user,
}: {
  readDraftId: string;
  user: User;
}) {
  try {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reads/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
          "Accept-Language": "fr",
          origin: process.env.NEXT_PUBLIC_APP_URL!,
        },
        body: JSON.stringify({ readDraftId, featured: false }),
      },
    );
    const response = await request.json();
    if (response.success === true) {
      revalidatePath(`/`);
      revalidatePath(`/categories`);
      revalidatePath(`/author/reads`);
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

export async function SaveRead({
  readId,
  user,
  title,
  description,
  category,
  content,
  imageBase64,
  imageType,
  existingImageUrl,
}: {
  readId: string;
  user: User;
  title: string;
  description: string;
  category: string;
  content: string;
  imageBase64: string | null;
  imageType: string | null;
  existingImageUrl: string | null;
}) {
  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("content", content);

    if (imageBase64 && imageType) {
      // New image uploaded — convert base64 back to File
      const buffer = Buffer.from(imageBase64, "base64");
      const blob = new Blob([buffer], { type: imageType });
      const file = new File([blob], "image.jpg", { type: imageType });
      formData.append("image", file);
    } else if (existingImageUrl) {
      // No new image — re-fetch the existing one
      const res = await fetch(existingImageUrl);
      const blob = await res.blob();
      const file = new File([blob], "existing-image.jpg", { type: blob.type });
      formData.append("image", file);
    }

    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reads/${readId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          "Accept-Language": "fr",
          origin: process.env.NEXT_PUBLIC_APP_URL!,
        },
        body: formData,
      },
    );

    const response = await request.json();
    if (response.success === true) {
      revalidatePath(`/author/reads/${readId}`);
      revalidatePath(`/author/reads`);
      return { success: true, draft: response.draft };
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

export async function AddReadComment({
  body,
  user,
  read,
}: {
  body: unknown;
  user: User;
  read: Read;
}) {
  try {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/comments/read`,
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
      revalidatePath(`/reads/${Slugify(read.title)}`);
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

export async function AddReadToFavorite({
  user,
  read,
  pathname,
}: {
  user: User;
  read: Read;
  pathname: string;
}) {
  try {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/favorites`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
          "Accept-Language": "fr",
          origin: process.env.NEXT_PUBLIC_APP_URL!,
        },
        body: JSON.stringify({ readId: read.readId }),
      },
    );
    const response = await request.json();
    if (response.success === true) {
      revalidatePath(pathname);
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

export async function RemoveReadToFavorite({
  user,
  read,
  pathname,
}: {
  user: User;
  read: Read;
  pathname: string;
}) {
  try {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/favorites`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
          "Accept-Language": "fr",
          origin: process.env.NEXT_PUBLIC_APP_URL!,
        },
        body: JSON.stringify({ readId: read.readId }),
      },
    );
    const response = await request.json();
    if (response.success === true) {
      revalidatePath(pathname);
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

export async function SetFeatured({
  user,
  read,
  featured,
}: {
  user: User;
  read: Read;
  featured: boolean;
}) {
  try {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/setFeaturedRead`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
          "Accept-Language": "fr",
          origin: process.env.NEXT_PUBLIC_APP_URL!,
        },
        body: JSON.stringify({ readId: read.readId, featured }),
      },
    );
    const response = await request.json();
    if (response.success === true) {
      revalidatePath("/admin");
      revalidatePath("/");
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
