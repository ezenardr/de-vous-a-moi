import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "@/test/db";

const state = vi.hoisted(() => ({
  db: undefined as unknown,
  session: null as null | { user: { userId: string } },
  uploads: [] as string[],
  deleted: [] as string[],
  ip: "203.0.113.1",
}));

// No network: the duration lookup answers from here.
vi.mock("@/lib/youtube", async (original) => ({ ...(await original<typeof import("@/lib/youtube")>()), fetchYoutubeDuration: async () => 213 }));
vi.mock("@/server/db", () => ({
  get db() {
    return state.db;
  },
}));
vi.mock("@/lib/auth", () => ({ auth: async () => state.session }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": state.ip }) }));
vi.mock("next/cache", () => ({ revalidatePath: () => {}, revalidateTag: () => {}, unstable_cache: (fn: unknown) => fn }));
vi.mock("@/server/storage", () => ({
  isUploadedImage: (v: unknown) => v instanceof File && v.size > 0,
  uploadImage: async (_file: File, name: string) => {
    const fileId = `file_${state.uploads.length + 1}`;
    state.uploads.push(name);
    return { fileId, url: `https://cdn.test/${fileId}` };
  },
  deleteImage: async (fileId?: string | null) => void (fileId && state.deleted.push(fileId)),
}));

const readActions = await import("./reads");
const watchActions = await import("./watch");
const adminActions = await import("./admin");
const commentActions = await import("./comments");
const commentQueries = await import("@/server/queries/comments");
const userActions = await import("./user");
const engagement = await import("./engagement");
const readQueries = await import("@/server/queries/reads");
const studioQueries = await import("@/server/queries/studio");
const s = await import("@/server/db/schema");

type Db = Awaited<ReturnType<typeof createTestDb>>;
const db = () => state.db as Db;
const image = () => new File([new Uint8Array([1, 2, 3])], "cover.png", { type: "image/png" });
const as = (userId: string) => (state.session = { user: { userId } });

async function seedUser(role: "1" | "2" | "3" | "4") {
  const userId = randomUUID();
  await db().insert(s.users).values({
    userId,
    firstName: `R${role}`,
    lastName: "Test",
    email: `${userId}@example.com`,
    password: "x",
    role,
    imageFileId: "old_avatar",
    createdAt: new Date(),
  });
  return userId;
}

async function seedRead(userId: string, extra: Partial<typeof s.reads.$inferInsert> = {}) {
  const readId = randomUUID();
  await db().insert(s.reads).values({
    readId,
    userId,
    title: "Titre",
    description: "Desc",
    imageUrl: "https://cdn.test/old",
    imageFileId: "old_cover",
    category: "Style de vie",
    content: "<p>Contenu</p>",
    createdAt: new Date(),
    ...extra,
  });
  return readId;
}

const draftForm = (fields: Record<string, string>, withImage = false) => {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  if (withImage) form.append("image", image());
  return form;
};
const complete = { title: "Un titre", description: "Une description", category: "Actualités", content: "<p>Texte</p>" };

let reader: string, author: string, otherAuthor: string, admin: string;
beforeEach(async () => {
  state.db = await createTestDb();
  state.session = null;
  state.uploads = [];
  state.deleted = [];
  state.ip = "203.0.113.1";
  [reader, author, otherAuthor, admin] = await Promise.all([seedUser("1"), seedUser("2"), seedUser("2"), seedUser("3")]);
});

describe("authorization (roles come from the database, not the session)", () => {
  it("rejects anonymous users", async () => {
    expect(await readActions.CreateDraft()).toMatchObject({ success: false });
    expect(await commentActions.PostComment({ kind: "read", itemId: randomUUID(), comment: "Bonjour" })).toMatchObject({ success: false });
    expect(await userActions.updateUserName({ firstName: "A", lastName: "B" }, "/")).toMatchObject({ success: false });
  });

  it("keeps readers out of the studio and authors out of admin", async () => {
    as(reader);
    expect(await readActions.CreateDraft()).toMatchObject({ success: false, error: "Vous n'êtes pas autorisé à créer d'article" });
    as(author);
    const readId = await seedRead(author);
    expect(await adminActions.SetContentFeatured({ kind: "read", id: readId, featured: true })).toMatchObject({ success: false });
    expect(await adminActions.SetContentArchived({ kind: "read", id: readId, archived: true })).toMatchObject({ success: false });
    as(admin);
    expect(await adminActions.SetContentFeatured({ kind: "read", id: readId, featured: true })).toEqual({ success: true });
  });

  it("never lets one author touch another author's drafts or reads", async () => {
    as(author);
    const created = await readActions.CreateDraft();
    if (!created.success) throw new Error(created.error);
    const readDraftId = created.read.readDraftId;
    const readId = await seedRead(author);

    as(otherAuthor);
    expect(await readActions.SaveDraft({ readDraftId, body: draftForm(complete) })).toMatchObject({ success: false });
    expect(await readActions.PublishRead({ readDraftId })).toMatchObject({ success: false });
    expect(await readActions.DeleteDraft({ readDraftId })).toMatchObject({ success: false });
    expect(await readActions.SaveRead({ readId, body: draftForm(complete) })).toMatchObject({ success: false });
    expect(await db().select().from(s.readDrafts)).toHaveLength(1);
    expect((await db().select().from(s.reads).where(eq(s.reads.readId, readId)))[0].title).toBe("Titre");
  });
});

describe("drafts and publishing", () => {
  it("keeps the existing cover unless a new one is uploaded, and replaces it cleanly", async () => {
    as(author);
    const created = await readActions.CreateDraft();
    if (!created.success) throw new Error(created.error);
    const { readDraftId } = created.read;

    const first = await readActions.SaveDraft({ readDraftId, body: draftForm(complete, true) });
    expect(first).toMatchObject({ success: true, draft: { imageFileId: "file_1", title: "Un titre" } });
    const second = await readActions.SaveDraft({ readDraftId, body: draftForm({ ...complete, title: "Nouveau" }) });
    expect(second).toMatchObject({ success: true, draft: { imageFileId: "file_1", title: "Nouveau" } });
    expect(state.uploads).toHaveLength(1); // no re-upload on a plain save
    await readActions.SaveDraft({ readDraftId, body: draftForm(complete, true) });
    expect(state.deleted).toEqual(["file_1"]); // the replaced cover is removed
  });

  it("refuses to publish an incomplete draft with a clear message and keeps it", async () => {
    as(author);
    const created = await readActions.CreateDraft();
    if (!created.success) throw new Error(created.error);
    const { readDraftId } = created.read;
    await readActions.SaveDraft({ readDraftId, body: draftForm({ title: "Seulement un titre" }) });
    const result = await readActions.PublishRead({ readDraftId });
    expect(result).toMatchObject({ success: false });
    expect(result.success === false && result.error).toContain("compléter");
    expect(await db().select().from(s.readDrafts)).toHaveLength(1);
    expect(await db().select().from(s.reads).where(eq(s.reads.userId, author))).toHaveLength(0);
  });

  it("publishes a complete draft as a non-featured read and removes the draft", async () => {
    as(author);
    const created = await readActions.CreateDraft();
    if (!created.success) throw new Error(created.error);
    const { readDraftId } = created.read;
    await readActions.SaveDraft({ readDraftId, body: draftForm(complete, true) });
    const result = await readActions.PublishRead({ readDraftId });
    expect(result.success).toBe(true);
    const [read] = await db().select().from(s.reads).where(eq(s.reads.userId, author));
    expect(read).toMatchObject({ ...complete, featured: false, archived: false, imageFileId: "file_1" });
    expect(await db().select().from(s.readDrafts)).toHaveLength(0);
  });

  it("deletes a draft and its cover", async () => {
    as(author);
    const created = await readActions.CreateDraft();
    if (!created.success) throw new Error(created.error);
    await readActions.SaveDraft({ readDraftId: created.read.readDraftId, body: draftForm(complete, true) });
    expect(await readActions.DeleteDraft({ readDraftId: created.read.readDraftId })).toEqual({ success: true });
    expect(await db().select().from(s.readDrafts)).toHaveLength(0);
    expect(state.deleted).toEqual(["file_1"]);
  });

  it("rejects titles longer than the varchar(255) column instead of failing in the database", async () => {
    as(author);
    const readId = await seedRead(author);
    const result = await readActions.SaveRead({ readId, body: draftForm({ ...complete, title: "x".repeat(256) }) });
    expect(result).toMatchObject({ success: false });
  });
});

describe("featured content (admin)", () => {
  const featuredIds = async () =>
    (await db().select({ id: s.reads.readId }).from(s.reads).where(eq(s.reads.featured, true))).map((r) => r.id).sort();

  it("allows at most 2 featured reads", async () => {
    as(admin);
    const ids = await Promise.all([1, 2, 3].map(() => seedRead(author)));
    for (const id of ids.slice(0, 2)) {
      expect(await adminActions.SetContentFeatured({ kind: "read", id, featured: true })).toEqual({ success: true });
    }
    expect(await adminActions.SetContentFeatured({ kind: "read", id: ids[2], featured: true })).toMatchObject({ success: false });
    expect(await featuredIds()).toEqual(ids.slice(0, 2).sort());
    expect(await adminActions.SetContentFeatured({ kind: "read", id: ids[0], featured: false })).toEqual({ success: true });
    expect(await adminActions.SetContentFeatured({ kind: "read", id: ids[2], featured: true })).toEqual({ success: true });
  });

  it("swaps in one transaction, and rolls back when the incoming item can't be featured", async () => {
    as(admin);
    const [a, b, c] = await Promise.all([1, 2, 3].map(() => seedRead(author)));
    const archived = await seedRead(author, { archived: true });
    const scheduled = await seedRead(author, { publishedAt: new Date(Date.now() + 86_400_000) });
    for (const id of [a, b]) await adminActions.SetContentFeatured({ kind: "read", id, featured: true });

    expect(await adminActions.SwapContentFeatured({ kind: "read", outId: a, inId: archived })).toMatchObject({ success: false });
    expect(await adminActions.SwapContentFeatured({ kind: "read", outId: a, inId: scheduled })).toMatchObject({ success: false });
    expect(await featuredIds()).toEqual([a, b].sort());

    expect(await adminActions.SwapContentFeatured({ kind: "read", outId: a, inId: c })).toEqual({ success: true });
    expect(await featuredIds()).toEqual([b, c].sort());
  });

  it("archiving hides an item and frees its featured slot; unarchiving restores it unfeatured", async () => {
    as(admin);
    const id = await seedRead(author);
    await adminActions.SetContentFeatured({ kind: "read", id, featured: true });
    expect(await adminActions.SetContentArchived({ kind: "read", id, archived: true })).toEqual({ success: true });
    const [row] = await db().select().from(s.reads).where(eq(s.reads.readId, id));
    expect(row).toMatchObject({ archived: true, featured: false });
    expect(await adminActions.SetContentArchived({ kind: "read", id, archived: false })).toEqual({ success: true });
    const [back] = await db().select().from(s.reads).where(eq(s.reads.readId, id));
    expect(back).toMatchObject({ archived: false, featured: false });
  });
});

describe("reader interactions", () => {
  it("saves favorites idempotently and removes them", async () => {
    const readId = await seedRead(author);
    as(reader);
    expect(await readActions.AddReadToFavorite({ read: { readId }, pathname: "/" })).toEqual({ success: true });
    expect(await readActions.AddReadToFavorite({ read: { readId }, pathname: "/" })).toEqual({ success: true });
    expect(await db().select().from(s.favorites)).toHaveLength(1);
    expect(await readActions.RemoveReadToFavorite({ read: { readId }, pathname: "/" })).toEqual({ success: true });
    expect(await db().select().from(s.favorites)).toHaveLength(0);
  });

  it("validates comments and refuses archived or unknown reads", async () => {
    const readId = await seedRead(author);
    const archivedId = await seedRead(author, { archived: true });
    as(reader);
    expect(await commentActions.PostComment({ kind: "read", itemId: readId, comment: "ok" })).toMatchObject({ success: false });
    expect(await commentActions.PostComment({ kind: "read", itemId: archivedId, comment: "Très bien" })).toMatchObject({ success: false });
    expect(await commentActions.PostComment({ kind: "read", itemId: readId, comment: "Très bel article" })).toMatchObject({ success: true });
    const [comment] = await db().select().from(s.readComments);
    expect(comment).toMatchObject({ readId, userId: reader, comment: "Très bel article" });
  });
});

describe("watches", () => {
  it("requires an image and a valid video URL, then publishes", async () => {
    as(author);
    const form = draftForm({ title: "Vidéo", description: "Desc", videoUrl: "pas une url" }, true);
    expect(await watchActions.PublishWatch({ body: form })).toMatchObject({ success: false });
    const noImage = draftForm({ title: "Vidéo", description: "Desc", videoUrl: "https://youtu.be/dQw4w9WgXcQ" });
    expect(await watchActions.PublishWatch({ body: noImage })).toMatchObject({ success: false });
    const ok = draftForm({ title: "Vidéo", description: "Desc", videoUrl: "https://youtu.be/dQw4w9WgXcQ" }, true);
    const result = await watchActions.PublishWatch({ body: ok });
    expect(result).toMatchObject({ success: true, watch: { category: "Le Spotlight", userId: author } });
  });

  it("lets the author edit their video, and no one else", async () => {
    as(author);
    const published = await watchActions.PublishWatch({
      body: draftForm({ title: "Vidéo", description: "Desc", videoUrl: "https://youtu.be/dQw4w9WgXcQ" }, true),
    });
    if (!published.success) throw new Error(published.error);
    const { watchId } = published.watch;
    const edit = () => draftForm({ title: "Nouveau titre", description: "Nouvelle desc", videoUrl: "https://youtu.be/dQw4w9WgXcQ" });
    as(reader);
    expect(await watchActions.SaveWatch({ watchId, body: edit() })).toMatchObject({ success: false });
    as(author);
    expect(await watchActions.SaveWatch({ watchId, body: draftForm({ title: "", description: "Desc", videoUrl: "https://youtu.be/dQw4w9WgXcQ" }) })).toMatchObject({
      success: false,
    });
    expect(await watchActions.SaveWatch({ watchId, body: edit() })).toMatchObject({ success: true });
    const [watch] = await db().select().from(s.watches).where(eq(s.watches.watchId, watchId));
    expect(watch).toMatchObject({ title: "Nouveau titre", description: "Nouvelle desc", imageUrl: published.watch.imageUrl });
  });

  it("adds comments to watches", async () => {
    as(author);
    const published = await watchActions.PublishWatch({
      body: draftForm({ title: "Vidéo", description: "Desc", videoUrl: "https://youtu.be/dQw4w9WgXcQ" }, true),
    });
    if (!published.success) throw new Error(published.error);
    as(reader);
    expect(await commentActions.PostComment({ kind: "watch", itemId: published.watch.watchId, comment: "Superbe" })).toMatchObject({ success: true });
    expect(await db().select().from(s.watchComments)).toHaveLength(1);
  });
});

describe("profile", () => {
  it("updates name and preferences for the session user only", async () => {
    as(reader);
    expect(await userActions.updateUserName({ firstName: " Ada ", lastName: "Lovelace" }, "/")).toEqual({ success: true });
    expect(
      await userActions.updateUserNotificationPreferences({ newRead: false, newWatch: true, newsletter: false, accountActivity: true }, "/"),
    ).toEqual({ success: true });
    const [me] = await db().select().from(s.users).where(eq(s.users.userId, reader));
    expect(me).toMatchObject({ firstName: "Ada", lastName: "Lovelace", newRead: false, newsletter: false });
    const [other] = await db().select().from(s.users).where(eq(s.users.userId, author));
    expect(other.firstName).toBe("R2");
  });

  it("replaces the avatar and deletes the previous file", async () => {
    as(reader);
    const form = new FormData();
    form.append("image", image());
    expect(await userActions.uploadUserProfilePicture(form, "/")).toMatchObject({ success: true, imageFileId: "file_1" });
    expect(state.deleted).toEqual(["old_avatar"]);
  });
});

describe("article engagement", () => {
  it("counts views and shares once per visitor, and ignores bad or archived ids", async () => {
    const engagement = await import("./engagement");
    const readId = await seedRead(author);
    const archived = await seedRead(author, { archived: true });
    // The same visitor (IP) is counted once per hour; a script calling in a loop changes nothing.
    for (let i = 0; i < 5; i++) expect(await engagement.recordReadView(readId)).toEqual({ success: true });
    await engagement.recordReadShare(readId);
    state.ip = "198.51.100.7";
    await engagement.recordReadView(readId);
    await engagement.recordReadView(archived);
    expect((await engagement.recordReadView("not-a-uuid")).success).toBe(false);
    const rows = await db().select({ id: s.reads.readId, v: s.reads.viewCount, sh: s.reads.shareCount }).from(s.reads);
    expect(rows.find((r) => r.id === readId)).toMatchObject({ v: 2, sh: 1 });
    expect(rows.find((r) => r.id === archived)).toMatchObject({ v: 0, sh: 0 });
  });

  it("toggles likes per user and returns the new count", async () => {
    const engagement = await import("./engagement");
    const readId = await seedRead(author);
    expect((await engagement.toggleReadLike(readId)).success).toBe(false); // anonymous
    as(reader);
    expect(await engagement.toggleReadLike(readId)).toEqual({ success: true, liked: true, likes: 1 });
    as(author);
    expect(await engagement.toggleReadLike(readId)).toEqual({ success: true, liked: true, likes: 2 });
    as(reader);
    expect(await engagement.toggleReadLike(readId)).toEqual({ success: true, liked: false, likes: 1 });
  });
});

describe("scheduled publishing", () => {
  const inHours = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();
  async function readyDraft() {
    const created = await readActions.CreateDraft();
    if (!created.success) throw new Error(created.error);
    await readActions.SaveDraft({ readDraftId: created.read.readDraftId, body: draftForm(complete, true) });
    return created.read.readDraftId;
  }

  it("keeps a scheduled read out of every public list and out of reach of likes", async () => {
    as(author);
    const published = await readActions.PublishRead({ readDraftId: await readyDraft(), publishAt: inHours(24) });
    if (!published.success) throw new Error(published.error);
    expect(published.scheduled).toBe(true);
    expect((await readQueries.getLatestReads()).map((r) => r.readId)).not.toContain(published.readId);
    expect(await readQueries.getArticle(published.readId)).toBeNull();
    const studio = await studioQueries.getStudioReads(author);
    expect(studio.items.find((i) => i.id === published.readId)?.status).toBe("scheduled");
    as(reader);
    expect((await engagement.toggleReadLike(published.readId)).success).toBe(false);
  });

  it("refuses a date in the past or more than a year away", async () => {
    as(author);
    const readDraftId = await readyDraft();
    expect((await readActions.PublishRead({ readDraftId, publishAt: inHours(-1) })).success).toBe(false);
    expect((await readActions.PublishRead({ readDraftId, publishAt: inHours(24 * 400) })).success).toBe(false);
    expect(await db().select().from(s.readDrafts)).toHaveLength(1);
  });

  it("publishes a scheduled read now, or sends it back to the drafts", async () => {
    as(author);
    const first = await readActions.PublishRead({ readDraftId: await readyDraft(), publishAt: inHours(2) });
    const second = await readActions.PublishRead({ readDraftId: await readyDraft(), publishAt: inHours(2) });
    if (!first.success || !second.success) throw new Error("publish failed");

    expect((await readActions.RescheduleRead({ readId: first.readId })).success).toBe(true);
    expect((await readQueries.getLatestReads()).map((r) => r.readId)).toContain(first.readId);
    // Already live: it can't be scheduled again (that would hide it).
    expect((await readActions.RescheduleRead({ readId: first.readId, publishAt: inHours(5) })).success).toBe(false);

    const back = await readActions.UnscheduleRead({ readId: second.readId });
    expect(back.success).toBe(true);
    expect(await db().select().from(s.reads).where(eq(s.reads.readId, second.readId))).toHaveLength(0);
    expect(await db().select().from(s.readDrafts)).toHaveLength(1);
  });

  it("only accepts the site's categories", async () => {
    as(author);
    const readId = await seedRead(author);
    expect((await readActions.SaveRead({ readId, body: draftForm({ ...complete, category: "Pas une catégorie" }) })).success).toBe(false);
  });
});

describe("comment threads and moderation", () => {
  async function post(userId: string, itemId: string, comment: string, parentId?: string) {
    as(userId);
    const result = await commentActions.PostComment({ kind: "read", itemId, comment, parentId });
    if (!result.success) throw new Error(result.error);
    return result.commentId;
  }

  it("allows replies one level deep, on the same item, to visible comments only", async () => {
    const readId = await seedRead(author);
    const otherRead = await seedRead(author);
    const top = await post(reader, readId, "Premier commentaire");
    const reply = await post(author, readId, "Merci beaucoup", top);
    as(reader);
    expect(await commentActions.PostComment({ kind: "read", itemId: readId, comment: "Réponse à une réponse", parentId: reply })).toMatchObject({ success: false });
    expect(await commentActions.PostComment({ kind: "read", itemId: otherRead, comment: "Mauvais article", parentId: top })).toMatchObject({ success: false });

    const { comments, count } = await commentQueries.getCommentThreads("read", readId, reader);
    expect(count).toBe(2);
    expect(comments).toHaveLength(1);
    expect(comments[0]).toMatchObject({ commentId: top, mine: true, hidden: false });
    expect(comments[0].replies).toMatchObject([{ commentId: reply, mine: false, comment: "Merci beaucoup" }]);
  });

  it("hides comments: a placeholder when replies remain, gone otherwise; only admins moderate", async () => {
    const readId = await seedRead(author);
    const withReply = await post(reader, readId, "Commentaire déplacé");
    await post(author, readId, "Une réponse", withReply);
    const alone = await post(reader, readId, "Autre commentaire déplacé");

    as(author);
    expect(await commentActions.SetCommentHidden({ kind: "read", commentId: alone, hidden: true })).toMatchObject({ success: false });
    as(admin);
    expect(await commentActions.SetCommentHidden({ kind: "read", commentId: alone, hidden: true })).toEqual({ success: true });
    expect(await commentActions.SetCommentHidden({ kind: "read", commentId: withReply, hidden: true })).toEqual({ success: true });

    const { comments, count } = await commentQueries.getCommentThreads("read", readId, reader);
    expect(count).toBe(1);
    expect(comments).toHaveLength(1);
    expect(comments[0]).toMatchObject({ commentId: withReply, hidden: true, comment: "", author: "", mine: false });
    expect(comments[0].replies).toHaveLength(1);

    as(reader);
    expect(await commentActions.PostComment({ kind: "read", itemId: readId, comment: "Je réponds", parentId: withReply })).toMatchObject({ success: false });
    expect(await commentActions.DeleteOwnComment({ kind: "read", commentId: alone })).toMatchObject({ success: false });

    as(admin);
    expect(await commentActions.SetCommentHidden({ kind: "read", commentId: alone, hidden: false })).toEqual({ success: true });
    expect((await commentQueries.getCommentThreads("read", readId)).count).toBe(2);
  });

  it("lets authors delete only their own comments, replies included; admins delete any", async () => {
    const readId = await seedRead(author);
    const top = await post(reader, readId, "À supprimer");
    await post(author, readId, "Réponse", top);
    const other = await post(author, readId, "Commentaire de l'auteur");

    as(reader);
    expect(await commentActions.DeleteOwnComment({ kind: "read", commentId: other })).toMatchObject({ success: false });
    expect(await commentActions.DeleteOwnComment({ kind: "read", commentId: top })).toEqual({ success: true });
    expect(await db().select().from(s.readComments)).toHaveLength(1);

    expect(await commentActions.AdminDeleteComment({ kind: "read", commentId: other })).toMatchObject({ success: false });
    as(admin);
    expect(await commentActions.AdminDeleteComment({ kind: "read", commentId: other })).toEqual({ success: true });
    expect(await db().select().from(s.readComments)).toHaveLength(0);
  });
});

describe("roles (admin › utilisateurs)", () => {
  const roleOf = async (userId: string) => (await db().select({ role: s.users.role }).from(s.users).where(eq(s.users.userId, userId)))[0].role;

  it("lets only the owner change roles, never their own, another owner's, or to owner", async () => {
    const owner = await seedUser("4");
    const otherOwner = await seedUser("4");

    as(admin);
    expect(await adminActions.SetUserRole({ userId: reader, role: "2" })).toMatchObject({ success: false });
    expect(await roleOf(reader)).toBe("1");

    as(owner);
    expect(await adminActions.SetUserRole({ userId: reader, role: "2" })).toEqual({ success: true });
    expect(await roleOf(reader)).toBe("2");
    expect(await adminActions.SetUserRole({ userId: admin, role: "1" })).toEqual({ success: true });
    expect(await roleOf(admin)).toBe("1");
    expect(await adminActions.SetUserRole({ userId: owner, role: "3" })).toMatchObject({ success: false });
    expect(await adminActions.SetUserRole({ userId: otherOwner, role: "1" })).toMatchObject({ success: false });
    expect(await adminActions.SetUserRole({ userId: reader, role: "4" as "3" })).toMatchObject({ success: false });
    expect(await roleOf(otherOwner)).toBe("4");
  });
});

describe("deleting accounts (admin › utilisateurs)", () => {
  it("lets only the owner delete reader accounts without content, all or nothing", async () => {
    const owner = await seedUser("4");
    const bot = await seedUser("1");
    const commenter = await seedUser("1");
    const readId = await seedRead(author);
    await db().insert(s.readComments).values({ readCommentId: randomUUID(), readId, userId: commenter, comment: "Bonjour", createdAt: new Date() });

    as(admin);
    expect(await adminActions.DeleteUsers({ userIds: [bot] })).toMatchObject({ success: false });

    as(owner);
    expect(await adminActions.DeleteUsers({ userIds: [bot, author] })).toMatchObject({ success: false });
    expect(await adminActions.DeleteUsers({ userIds: [owner] })).toMatchObject({ success: false });
    expect(await db().select().from(s.users).where(eq(s.users.userId, bot))).toHaveLength(1);

    expect(await adminActions.DeleteUsers({ userIds: [bot, commenter] })).toEqual({ success: true, deleted: 2 });
    expect(await db().select().from(s.users).where(eq(s.users.userId, bot))).toHaveLength(0);
    expect(await db().select().from(s.readComments)).toHaveLength(0);
    expect(await db().select().from(s.reads)).toHaveLength(1);
  });
});

describe("comment rate limit", () => {
  it("lets an account post 10 comments per 10 minutes, then asks it to wait", async () => {
    const readId = await seedRead(author);
    as(reader);
    for (let i = 0; i < 10; i++) {
      expect(await commentActions.PostComment({ kind: "read", itemId: readId, comment: `Commentaire ${i}` })).toMatchObject({ success: true });
    }
    const blocked = await commentActions.PostComment({ kind: "read", itemId: readId, comment: "Encore un" });
    expect(blocked).toMatchObject({ success: false });
    expect(blocked.success === false && blocked.error).toMatch(/Réessayez dans/);
    // Another account is not affected.
    as(author);
    expect(await commentActions.PostComment({ kind: "read", itemId: readId, comment: "Merci à tous" })).toMatchObject({ success: true });
  });
});
