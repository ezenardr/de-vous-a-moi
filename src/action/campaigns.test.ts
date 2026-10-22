import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "@/test/db";

process.env.NEXT_PUBLIC_APP_URL = "https://devousamoi.test";

const state = vi.hoisted(() => ({
  db: undefined as unknown,
  session: null as null | { user: { userId: string } },
  batches: [] as { to: string; html: string; unsubscribeUrl: string }[][],
  tests: [] as string[],
  failNextBatch: false,
}));

vi.mock("@/server/db", () => ({
  get db() {
    return state.db;
  },
}));
vi.mock("@/lib/auth", () => ({ auth: async () => state.session }));
vi.mock("next/cache", () => ({ revalidatePath: () => {}, revalidateTag: () => {}, unstable_cache: (fn: unknown) => fn }));
vi.mock("@/server/email", () => ({
  sendNewsletterBatch: async (messages: { to: string; html: string; unsubscribeUrl: string }[]) => {
    if (state.failNextBatch) {
      state.failNextBatch = false;
      throw new Error("Resend down");
    }
    state.batches.push(messages);
  },
  sendNewsletterTest: async (message: { to: string }) => void state.tests.push(message.to),
}));

const actions = await import("./campaigns");
const s = await import("@/server/db/schema");

type Db = Awaited<ReturnType<typeof createTestDb>>;
const db = () => state.db as Db;
const as = (userId: string) => (state.session = { user: { userId } });

async function seedUser(role: "1" | "3") {
  const userId = randomUUID();
  await db().insert(s.users).values({ userId, firstName: "A", lastName: "B", email: `${userId}@example.com`, password: "x", role, createdAt: new Date() });
  return userId;
}

async function seedSubscribers(n: number, status = "active") {
  const emails = Array.from({ length: n }, (_, i) => `abonne${i}-${randomUUID().slice(0, 6)}@example.com`);
  if (n) await db().insert(s.newsletterSubscribers).values(emails.map((email) => ({ email, status, unsubscribeToken: randomUUID() })));
  return emails;
}

async function readyCampaign() {
  const created = await actions.CreateCampaign();
  if (!created.success) throw new Error(created.error);
  const saved = await actions.SaveCampaign({ campaignId: created.campaignId, subject: "Les nouvelles", preheader: "", body: "<p>Bonjour à tous</p>", items: [] });
  if (!saved.success) throw new Error(saved.error);
  return created.campaignId;
}

const deliveries = (campaignId: string) => db().select().from(s.newsletterDeliveries).where(eq(s.newsletterDeliveries.campaignId, campaignId));
const status = async (campaignId: string) => (await db().select().from(s.newsletterCampaigns).where(eq(s.newsletterCampaigns.campaignId, campaignId)))[0].status;

let admin: string, reader: string;
beforeEach(async () => {
  state.db = await createTestDb();
  state.session = null;
  state.batches = [];
  state.tests = [];
  state.failNextBatch = false;
  [admin, reader] = await Promise.all([seedUser("3"), seedUser("1")]);
});

describe("newsletter campaigns", () => {
  it("is admin-only", async () => {
    as(reader);
    expect(await actions.CreateCampaign()).toMatchObject({ success: false });
    as(admin);
    const campaignId = await readyCampaign();
    as(reader);
    expect(await actions.SendCampaign({ campaignId, expected: 0 })).toMatchObject({ success: false });
    expect(await actions.SendCampaignTest({ campaignId })).toMatchObject({ success: false });
  });

  it("refuses to send an incomplete draft, an empty list, or when the confirmed count is stale", async () => {
    as(admin);
    const created = await actions.CreateCampaign();
    if (!created.success) throw new Error();
    expect(await actions.SendCampaignTest({ campaignId: created.campaignId })).toMatchObject({ success: false });

    const campaignId = await readyCampaign();
    expect(await actions.SendCampaign({ campaignId, expected: 0 })).toMatchObject({ success: false });
    await seedSubscribers(3);
    expect(await actions.SendCampaign({ campaignId, expected: 2 })).toMatchObject({ success: false, count: 3 });
    expect(await status(campaignId)).toBe("draft");
    expect(state.batches).toHaveLength(0);
  });

  it("sends once to every active subscriber, in batches of 100, each with their own unsubscribe link", async () => {
    as(admin);
    const campaignId = await readyCampaign();
    const emails = await seedSubscribers(150);
    await seedSubscribers(2, "unsubscribed");

    expect(await actions.SendCampaign({ campaignId, expected: 150 })).toMatchObject({ success: true, sent: 150, failed: 0 });
    expect(state.batches.map((b) => b.length)).toEqual([100, 50]);
    const sentTo = state.batches.flat().map((m) => m.to).sort();
    expect(sentTo).toEqual([...emails].sort());
    expect(new Set(state.batches.flat().map((m) => m.unsubscribeUrl)).size).toBe(150);
    expect(state.batches[0][0].html).toContain("Bonjour à tous");
    expect(await status(campaignId)).toBe("sent");

    // A second click changes nothing.
    expect(await actions.SendCampaign({ campaignId, expected: 150 })).toMatchObject({ success: false });
    expect(await actions.SaveCampaign({ campaignId, subject: "Modifié", preheader: "", body: "<p>x</p>", items: [] })).toMatchObject({ success: false });
    expect(state.batches.flat()).toHaveLength(150);
  });

  it("marks a failed batch, then resumes without mailing anyone twice", async () => {
    as(admin);
    const campaignId = await readyCampaign();
    await seedSubscribers(120);
    state.failNextBatch = true;

    expect(await actions.SendCampaign({ campaignId, expected: 120 })).toMatchObject({ success: true, sent: 20, failed: 100 });
    expect((await deliveries(campaignId)).filter((d) => d.status === "failed")).toHaveLength(100);
    expect(await status(campaignId)).toBe("sent");

    expect(await actions.ResumeCampaign({ campaignId })).toMatchObject({ success: true, sent: 100, failed: 0 });
    const all = await deliveries(campaignId);
    expect(all.every((d) => d.status === "sent")).toBe(true);
    expect(state.batches.flat()).toHaveLength(120);
    expect(new Set(state.batches.flat().map((m) => m.to)).size).toBe(120);
  });

  it("skips people who unsubscribed after the send started", async () => {
    as(admin);
    const campaignId = await readyCampaign();
    const [gone] = await seedSubscribers(3);
    // Simulate: snapshot taken, then the person unsubscribes before delivery.
    await db().update(s.newsletterCampaigns).set({ status: "sending" }).where(eq(s.newsletterCampaigns.campaignId, campaignId));
    await db().insert(s.newsletterDeliveries).values((await db().select().from(s.newsletterSubscribers)).map((r) => ({ campaignId, email: r.email })));
    await db().update(s.newsletterSubscribers).set({ status: "unsubscribed" }).where(eq(s.newsletterSubscribers.email, gone));

    expect(await actions.ResumeCampaign({ campaignId })).toMatchObject({ success: true, sent: 2, failed: 0, skipped: 1 });
    expect(state.batches.flat().map((m) => m.to)).not.toContain(gone);
  });

  it("sends the test to the admin only and lets drafts be deleted", async () => {
    as(admin);
    const campaignId = await readyCampaign();
    await seedSubscribers(5);
    expect(await actions.SendCampaignTest({ campaignId })).toMatchObject({ success: true });
    expect(state.tests).toEqual([`${admin}@example.com`]);
    expect(state.batches).toHaveLength(0);
    expect(await actions.DeleteCampaign({ campaignId })).toEqual({ success: true });
    expect(await db().select().from(s.newsletterCampaigns)).toHaveLength(0);
  });
});
