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
  body,
}: {
  readId: string;
  user: User;
  body: FormData;
}) {
  try {
    const request = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reads/${readId}`,
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
      revalidatePath(`/author/reads/${readId}`);
      revalidatePath(`/author/reads`);
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
