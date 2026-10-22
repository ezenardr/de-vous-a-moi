import "server-only";
import { auth } from "@/lib/auth";
import { findUserById, type UserRow } from "./users";

// Same bitmask model as api.messarae.com/app/roles/roles.ts.
const READS_VIEW = 1 << 0;
const READS_CREATE = 1 << 1;
const READS_DELETE = 1 << 2;
const READS_UPDATE = 1 << 3;
const ADMIN = 1 << 4;

const AUTHOR = READS_VIEW | READS_CREATE | READS_DELETE | READS_UPDATE;
const permissions: Record<string, number> = {
  "1": READS_VIEW, // User
  "2": AUTHOR, // Author
  "3": AUTHOR | ADMIN, // Admin
  "4": AUTHOR | ADMIN, // Owner
};

export const Actions = { createReads: READS_CREATE, admin: ADMIN } as const;

export const can = (user: Pick<UserRow, "role"> | null, action: number) =>
  !!user && ((permissions[user.role ?? "1"] ?? 0) & action) === action;

// A message safe to show to the user; anything else is logged and replaced by a generic error.
export class ActionError extends Error {}

// Roles are always read from the database, never from the session token.
export async function currentUser(): Promise<UserRow | null> {
  const session = await auth();
  const userId = session?.user?.userId;
  return userId ? findUserById(userId) : null;
}

export async function requireUser(): Promise<UserRow> {
  const user = await currentUser();
  if (!user) throw new ActionError("Veuillez vous connecter.");
  return user;
}

export async function requireAuthor(): Promise<UserRow> {
  const user = await requireUser();
  if (!can(user, Actions.createReads)) throw new ActionError("Vous n'êtes pas autorisé à créer d'article");
  return user;
}

export async function requireAdmin(): Promise<UserRow> {
  const user = await requireUser();
  if (!can(user, Actions.admin)) throw new ActionError("Vous n'êtes pas un administrateur");
  return user;
}

export function toActionError(error: unknown, context: string) {
  if (error instanceof ActionError) return { error: error.message };
  // Local development opens production read-only (server/db): say so instead of a generic error.
  const cause = (error as { cause?: { code?: string } } | null)?.cause;
  if (cause?.code === "25006" || (error as { code?: string } | null)?.code === "25006") {
    console.warn(`${context} refused: the database is read-only here (set DB_ALLOW_WRITES=true to write)`);
    return { error: "Base de données en lecture seule en local : ajoutez DB_ALLOW_WRITES=true pour enregistrer." };
  }
  console.error(`${context} failed`, error);
  return { error: "Une erreur est survenue. Veuillez réessayer." };
}
