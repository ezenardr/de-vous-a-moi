import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { hashPassword, verifyPassword } from "./password";

export type UserRow = typeof users.$inferSelect;

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user ?? null;
}

export async function findUserById(userId: string): Promise<UserRow | null> {
  const [user] = await db.select().from(users).where(eq(users.userId, userId)).limit(1);
  return user ?? null;
}

// Verifies a hash even when the email is unknown, so response time doesn't reveal which emails exist.
let dummyHash: Promise<string> | undefined;
export async function checkCredentials(email: string, password: string): Promise<UserRow | null> {
  const user = await findUserByEmail(email);
  const valid = await verifyPassword(user?.password ?? (await (dummyHash ??= hashPassword("timing-equalizer"))), password);
  return user && valid ? user : null;
}

// What goes into the session JWT. Never the password hash.
export function toSessionUser(user: UserRow, accessToken: string) {
  return {
    id: user.userId,
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profileImageUrl: user.profileImageUrl ?? undefined,
    imageFileId: user.imageFileId ?? undefined,
    role: user.role ?? "1",
    newRead: user.newRead,
    newWatch: user.newWatch,
    newsletter: user.newsletter,
    accountActivity: user.accountActivity,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
    accessToken,
  };
}
