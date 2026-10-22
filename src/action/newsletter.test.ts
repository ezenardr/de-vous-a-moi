import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "@/test/db";

process.env.NEXT_PUBLIC_APP_URL = "https://devousamoi.test";

const state = vi.hoisted(() => ({
  db: undefined as unknown,
  session: null as null | { user: { userId: string; email: string } },
  emails: [] as { to: string; link: string }[],
  turnstileOk: true,
  ip: "203.0.113.7",
}));

vi.mock("@/server/db", () => ({
  get db() {
    return state.db;
  },
}));
vi.mock("@/lib/auth", () => ({ auth: async () => state.session }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": state.ip }) }));
vi.mock("@/server/turnstile", () => ({ verifyTurnstile: async () => state.turnstileOk }));
vi.mock("@/server/email", () => ({
  sendNewsletterWelcomeEmail: async (to: string, link: string) => void state.emails.push({ to, link }),
}));

const { subscribeNewsletter, unsubscribeNewsletter } = await import("./newsletter");
const { newsletterSubscribers, users } = await import("@/server/db/schema");

type Db = Awaited<ReturnType<typeof createTestDb>>;
const db = () => state.db as Db;
const longAgo = () => Date.now() - 10_000; // opened the dialog 10s ago, like a person
const rows = () => db().select().from(newsletterSubscribers);

beforeEach(async () => {
  state.db = await createTestDb();
  state.session = null;
  state.emails = [];
  state.turnstileOk = true;
  state.ip = "203.0.113.7";
});

describe("newsletter sign-up", () => {
  it("subscribes a visitor once and sends one welcome email with an unsubscribe link", async () => {
    expect(await subscribeNewsletter({ email: " Lectrice@Example.com ", turnstileToken: "t", openedAt: longAgo() })).toEqual({ success: true });
    expect(await subscribeNewsletter({ email: "lectrice@example.com", turnstileToken: "t", openedAt: longAgo() })).toEqual({ success: true });
    const [row] = await rows();
    expect(row).toMatchObject({ email: "lectrice@example.com", status: "active", userId: null });
    expect(state.emails).toHaveLength(1);
    expect(state.emails[0].link).toContain(`token=${row.unsubscribeToken}`);
  });

  it("silently ignores the honeypot and forms sent too fast", async () => {
    expect((await subscribeNewsletter({ email: "bot@example.com", website: "http://spam", turnstileToken: "t", openedAt: longAgo() })).success).toBe(true);
    expect((await subscribeNewsletter({ email: "bot@example.com", turnstileToken: "t", openedAt: Date.now() - 300 })).success).toBe(true);
    expect(await rows()).toHaveLength(0);
    expect(state.emails).toHaveLength(0);
  });

  it("refuses visitors who fail Turnstile", async () => {
    state.turnstileOk = false;
    expect((await subscribeNewsletter({ email: "lectrice@example.com", openedAt: longAgo() })).success).toBe(false);
    expect(await rows()).toHaveLength(0);
  });

  it("caps sign-ups per IP", async () => {
    for (let i = 0; i < 10; i++) {
      expect((await subscribeNewsletter({ email: `l${i}@example.com`, turnstileToken: "t", openedAt: longAgo() })).success).toBe(true);
    }
    expect((await subscribeNewsletter({ email: "encore@example.com", turnstileToken: "t", openedAt: longAgo() })).success).toBe(false);
  });

  it("links a reader's own address to their account and turns their preference on", async () => {
    const userId = randomUUID();
    await db().insert(users).values({ userId, firstName: "A", lastName: "B", email: "lecteur@example.com", password: "x", newsletter: false, createdAt: new Date() });
    state.session = { user: { userId, email: "lecteur@example.com" } };
    state.turnstileOk = false; // signed-in readers don't need Turnstile
    expect((await subscribeNewsletter({ email: "lecteur@example.com", openedAt: longAgo() })).success).toBe(true);
    const [row] = await rows();
    expect(row.userId).toBe(userId);
    const [user] = await db().select({ newsletter: users.newsletter }).from(users).where(eq(users.userId, userId));
    expect(user.newsletter).toBe(true);
  });
});

describe("newsletter unsubscribe", () => {
  it("unsubscribes by token, masks the address, and rejects unknown tokens", async () => {
    await subscribeNewsletter({ email: "lectrice@example.com", turnstileToken: "t", openedAt: longAgo() });
    const [row] = await rows();
    expect(await unsubscribeNewsletter(row.unsubscribeToken)).toEqual({ success: true, email: "lec****@example.com" });
    const [after] = await rows();
    expect(after.status).toBe("unsubscribed");
    expect((await unsubscribeNewsletter("nope")).success).toBe(false);
  });
});
