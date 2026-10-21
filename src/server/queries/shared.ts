import "server-only";
import { users } from "@/server/db/schema";

// The only author fields that may reach public pages.
export const publicAuthor = {
  firstName: users.firstName,
  lastName: users.lastName,
  profileImageUrl: users.profileImageUrl,
};

export type PublicAuthor = {
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
};

export const toIso = (date: Date | null) => (date ? date.toISOString() : null);
