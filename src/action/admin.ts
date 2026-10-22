"use server";

import { and, count, eq, inArray, isNull, ne, or, sql } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import z from "zod";
import { MAX_FEATURED } from "@/lib/featured";
import { ActionError, requireAdmin, requireUser, toActionError } from "@/server/auth/permissions";
import { db } from "@/server/db";
import { reads, users, watches } from "@/server/db/schema";
import { READS_TAG, publicRead } from "@/server/queries/reads";
import { WATCHES_TAG, publicWatch } from "@/server/queries/watches";

// Admin actions on any author's content. Every one re-checks the admin role.


const fail = (error: unknown, context: string) => ({ success: false as const, ...toActionError(error, context) });
const kindSchema = z.enum(["read", "watch"]);
type Kind = z.infer<typeof kindSchema>;

const CONTENT = {
  read: { table: reads, id: reads.readId, featured: reads.featured, archived: reads.archived, isPublic: publicRead, tag: READS_TAG, noun: "article" },
  watch: { table: watches, id: watches.watchId, featured: watches.featured, archived: watches.archived, isPublic: publicWatch, tag: WATCHES_TAG, noun: "vidéo" },
} as const;

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new ActionError("Données invalides");
  return result.data;
}

function refresh(kind: Kind) {
  revalidateTag(CONTENT[kind].tag, { expire: 0 });
  revalidatePath("/admin", "layout");
  revalidatePath(kind === "read" ? "/" : "/watches");
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function featuredCount(tx: Tx, kind: Kind) {
  const c = CONTENT[kind];
  const [{ total }] = await tx.select({ total: count() }).from(c.table).where(eq(c.featured, true));
  return total;
}

// Flags one public item, if there is a free slot.
async function feature(tx: Tx, kind: Kind, id: string) {
  const c = CONTENT[kind];
  const updated = await tx
    .update(c.table)
    .set({ featured: true })
    .where(and(eq(c.id, id), eq(c.featured, false), c.isPublic))
    .returning({ id: c.id });
  if (updated.length === 0) throw new ActionError(`Seul un contenu publié, pas encore en vedette, peut être mis en vedette.`);
  if ((await featuredCount(tx, kind)) > MAX_FEATURED) throw new ActionError(`${MAX_FEATURED} contenus maximum en vedette : remplacez-en un.`);
}

export async function SetContentFeatured(input: { kind: Kind; id: string; featured: boolean }) {
  try {
    await requireAdmin();
    const { kind, id, featured } = parse(z.object({ kind: kindSchema, id: z.uuid(), featured: z.boolean() }), input);
    const c = CONTENT[kind];
    await db.transaction(async (tx) => {
      if (featured) return feature(tx, kind, id);
      const updated = await tx.update(c.table).set({ featured: false }).where(eq(c.id, id)).returning({ id: c.id });
      if (updated.length === 0) throw new ActionError("Contenu introuvable");
    });
    refresh(kind);
    return { success: true as const };
  } catch (error) {
    return fail(error, "SetContentFeatured");
  }
}

// Replaces one featured item with another in a single transaction: both change, or neither does.
export async function SwapContentFeatured(input: { kind: Kind; outId: string; inId: string }) {
  try {
    await requireAdmin();
    const { kind, outId, inId } = parse(z.object({ kind: kindSchema, outId: z.uuid(), inId: z.uuid() }), input);
    const c = CONTENT[kind];
    await db.transaction(async (tx) => {
      const removed = await tx
        .update(c.table)
        .set({ featured: false })
        .where(and(eq(c.id, outId), eq(c.featured, true)))
        .returning({ id: c.id });
      if (removed.length === 0) throw new ActionError("Ce contenu n'est plus en vedette. Rechargez la page.");
      await feature(tx, kind, inId);
    });
    refresh(kind);
    return { success: true as const };
  } catch (error) {
    return fail(error, "SwapContentFeatured");
  }
}

// Archiving hides an item everywhere on the site (and frees its featured slot); unarchiving restores it.
export async function SetContentArchived(input: { kind: Kind; id: string; archived: boolean }) {
  try {
    await requireAdmin();
    const { kind, id, archived } = parse(z.object({ kind: kindSchema, id: z.uuid(), archived: z.boolean() }), input);
    const c = CONTENT[kind];
    const updated = await db
      .update(c.table)
      .set(archived ? { archived: true, featured: false } : { archived: false })
      .where(eq(c.id, id))
      .returning({ id: c.id });
    if (updated.length === 0) throw new ActionError("Contenu introuvable");
    refresh(kind);
    revalidatePath(kind === "read" ? "/author/reads" : "/author/watches", "layout");
    return { success: true as const };
  } catch (error) {
    return fail(error, "SetContentArchived");
  }
}

// Roles: only the owner changes them. Nobody changes their own role or the owner's, and the owner
// role itself is never handed out here.
export async function SetUserRole(input: { userId: string; role: "1" | "2" | "3" }) {
  try {
    const owner = await requireUser();
    if (owner.role !== "4") throw new ActionError("Seul le propriétaire peut changer les rôles.");
    const { userId, role } = parse(z.object({ userId: z.uuid(), role: z.enum(["1", "2", "3"]) }), input);
    if (userId === owner.userId) throw new ActionError("Vous ne pouvez pas changer votre propre rôle.");
    const updated = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(and(eq(users.userId, userId), or(isNull(users.role), ne(users.role, "4"))))
      .returning({ userId: users.userId });
    if (updated.length === 0) throw new ActionError("Utilisateur introuvable ou non modifiable.");
    revalidatePath("/admin", "layout");
    return { success: true as const };
  } catch (error) {
    return fail(error, "SetUserRole");
  }
}

// Deletes reader accounts for good (bot sign-ups, for instance). Owner only, like roles. Their
// comments, likes and saves go with them (foreign keys cascade). Authors and admins, and anyone with
// articles, videos or drafts, are refused: deleting them would take their content down too.
export async function DeleteUsers(input: { userIds: string[] }) {
  try {
    const owner = await requireUser();
    if (owner.role !== "4") throw new ActionError("Seul le propriétaire peut supprimer des comptes.");
    const { userIds } = parse(z.object({ userIds: z.array(z.uuid()).min(1).max(200) }), input);
    if (userIds.includes(owner.userId)) throw new ActionError("Vous ne pouvez pas supprimer votre propre compte ici.");
    const deleted = await db.transaction(async (tx) => {
      const removed = await tx
        .delete(users)
        .where(
          and(
            inArray(users.userId, userIds),
            or(isNull(users.role), eq(users.role, "1")),
            sql`not exists (select 1 from reads r where r.user_id = ${users.userId})`,
            sql`not exists (select 1 from watches w where w.user_id = ${users.userId})`,
            sql`not exists (select 1 from read_drafts d where d.user_id = ${users.userId})`,
          ),
        )
        .returning({ userId: users.userId });
      // All or nothing: if any account was refused, nothing is deleted.
      if (removed.length !== new Set(userIds).size) throw new ActionError("Certains comptes ne peuvent pas être supprimés (rôle ou contenus publiés).");
      return removed.length;
    });
    revalidatePath("/admin", "layout");
    return { success: true as const, deleted };
  } catch (error) {
    return fail(error, "DeleteUsers");
  }
}
