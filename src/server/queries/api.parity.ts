// Compares the new query layer with the live Adonis API. Run with: yarn parity
import { afterAll, describe, expect, it } from "vitest";
import * as readsQ from "./reads";
import * as watchesQ from "./watches";

const API = process.env.NEXT_PUBLIC_API_URL!;
const get = async (path: string) => (await fetch(`${API}${path}`)).json();
const ids = (items: { readId?: string; watchId?: string }[]) => items.map((i) => i.readId ?? i.watchId);

afterAll(async () => {
  const { db } = await import("@/server/db");
  await db.$client.end();
});

describe("parity with api.messarae.com", () => {
  it("latest reads (API default limit 15)", async () => {
    const api = await get("/reads");
    expect(ids(await readsQ.getLatestReads({ limit: 15 }))).toEqual(ids(api.reads));
  });

  it("featured reads", async () => {
    const api = await get("/featured/reads");
    expect(ids(await readsQ.getFeaturedReads())).toEqual(ids(api.reads));
  });

  it("categories and their reads", async () => {
    const api = await get("/categories");
    const mine = await readsQ.getCategories();
    expect(mine).toEqual(api.categories);
    for (const { category } of mine) {
      const apiReads = (await get(`/categories/${encodeURIComponent(category)}`)).reads;
      expect(ids(await readsQ.getReadsByCategory(category)).sort()).toEqual(ids(apiReads).sort());
    }
  });

  it("every read: content, author, counts, comments, related", async () => {
    const all = await readsQ.getLatestReads();
    expect(all.length).toBeGreaterThan(15); // the sitemap now gets every read, not just 15
    for (const { readId } of all) {
      const api = await get(`/reads/${readId}/related`);
      const mine = (await readsQ.getReadWithRelated(readId))!;
      expect(mine.read.title).toBe(api.read.title);
      expect(mine.read.content).toBe(api.read.content);
      expect(mine.read.createdAt).toBe(new Date(api.read.createdAt).toISOString());
      expect(mine.read.user).toEqual({
        firstName: api.read.user.firstName,
        lastName: api.read.user.lastName,
        profileImageUrl: api.read.user.profileImageUrl ?? null,
      });
      expect(mine.read.favoriteCount).toBe(api.read.favorites.length);
      expect(mine.read.comments.map((c) => c.readCommentId).sort()).toEqual(
        api.read.readComments.map((c: { readCommentId: string }) => c.readCommentId).sort(),
      );
      // The API's related list has no ORDER BY, so compare size and category only.
      expect(mine.related).toHaveLength(api.related.length);
      expect(mine.related.every((r) => r.category === mine.read.category && r.readId !== readId)).toBe(true);
    }
  });

  it("watches list and every watch", async () => {
    const api = await get("/watches");
    const mine = await watchesQ.getLatestWatches({ limit: 15 });
    expect(ids(mine)).toEqual(ids(api.watches));
    for (const { watchId } of mine) {
      const apiWatch = (await get(`/watches/${watchId}/related`)).watch;
      const watch = (await watchesQ.getWatch(watchId))!;
      expect(watch.videoUrl).toBe(apiWatch.videoUrl);
      expect(watch.favoriteCount).toBe(apiWatch.watchFavorites.length);
      expect(watch.comments).toHaveLength(apiWatch.watchComments.length);
    }
  });
});

describe("viewer-specific data", () => {
  it("isSaved and saved reads match the favorites table for every user who saved something", async () => {
    const { db } = await import("@/server/db");
    const { favorites } = await import("@/server/db/schema");
    const rows = await db.select({ userId: favorites.userId, readId: favorites.readId }).from(favorites);
    const byUser = Map.groupBy(rows, (r) => r.userId!);
    expect(byUser.size).toBeGreaterThan(0);
    for (const [userId, saved] of byUser) {
      const expected = saved.map((s) => s.readId).sort();
      expect((await readsQ.getSavedReads(userId)).map((r) => r.readId).sort()).toEqual(expected);
      const flagged = (await readsQ.getLatestReads({ viewerId: userId })).filter((r) => r.isSaved);
      expect(flagged.map((r) => r.readId).sort()).toEqual(expected);
    }
  });
});
