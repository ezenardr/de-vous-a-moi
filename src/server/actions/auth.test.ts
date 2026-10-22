import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "@/test/db";

process.env.AUTH_SECRET = "test-secret-test-secret-test-secret";
process.env.NEXT_PUBLIC_APP_URL = "https://devousamoi.test";

const state = vi.hoisted(() => ({
  db: undefined as unknown,
  session: null as null | { user: { userId: string } },
  emails: [] as { kind: string; to: string; link?: string }[],
  ip: "203.0.113.7",
  turnstileOk: true,
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
  sendVerificationEmail: async (to: string, _name: string, link: string) => void state.emails.push({ kind: "verify", to, link }),
  sendWelcomeEmail: async (to: string) => void state.emails.push({ kind: "welcome", to }),
  sendPasswordResetEmail: async (to: string, _name: string, link: string) => void state.emails.push({ kind: "reset", to, link }),
  sendPasswordChangedEmail: async (to: string) => void state.emails.push({ kind: "changed", to }),
}));

const actions = await import("./auth");
const { users, authAccessTokens } = await import("@/server/db/schema");
const { hashPassword, verifyPassword } = await import("@/server/auth/password");
const { checkCredentials } = await import("@/server/auth/users");
const { openToken, sealToken } = await import("@/server/auth/tokens");

type Db = Awaited<ReturnType<typeof createTestDb>>;
const db = () => state.db as Db;
const tokenFrom = (link: string) => new URL(link).searchParams.get("accessToken")!;
const lastEmail = (kind: string) => state.emails.findLast((e) => e.kind === kind)!;

async function seedUser(email = "lecteur@example.com", password = "Ancien!Mot1") {
  const userId = randomUUID();
  await db().insert(users).values({
    userId,
    firstName: "Lecteur",
    lastName: "Test",
    email,
    password: await hashPassword(password),
    createdAt: new Date(),
  });
  await db().insert(authAccessTokens).values({ tokenableId: userId, type: "auth_token", hash: "h", abilities: '["*"]' });
  return userId;
}

beforeEach(async () => {
  state.db = await createTestDb();
  state.session = null;
  state.emails = [];
  state.ip = "203.0.113.7";
  state.turnstileOk = true;
});

describe("registration", () => {
  const input = { firstName: "Ada", lastName: "Lovelace", email: "  Ada@Example.com ", password: "Secret!123" };

  it("emails a link on the configured domain whose token never contains the password", async () => {
    expect(await actions.register(input)).toEqual({ success: true });
    const { link, to } = lastEmail("verify");
    expect(to).toBe("ada@example.com");
    expect(link!.startsWith("https://devousamoi.test/auth/register/verified?")).toBe(true);
    const token = tokenFrom(link!);
    expect(Buffer.from(token, "base64url").toString("latin1")).not.toContain("Secret!123");
    expect(await db().select().from(users)).toHaveLength(0); // no account until confirmed
  });

  it("creates the account on confirmation, idempotently, with a usable password", async () => {
    await actions.register(input);
    const token = tokenFrom(lastEmail("verify").link!);
    expect(await actions.completeRegistration(token)).toEqual({ success: true });
    expect(await actions.completeRegistration(token)).toEqual({ success: true }); // link opened twice
    const created = await db().select().from(users);
    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({ email: "ada@example.com", role: "1", firstName: "Ada" });
    expect(await checkCredentials("ada@example.com", "Secret!123")).not.toBeNull();
    expect(state.emails.filter((e) => e.kind === "welcome")).toHaveLength(1);
  });

  it("refuses an email that already has an account", async () => {
    await seedUser("ada@example.com");
    const result = await actions.register(input);
    expect(result.success).toBe(false);
    expect(state.emails).toHaveLength(0);
  });

  it("rejects tampered, expired and wrong-purpose tokens", async () => {
    await actions.register(input);
    const token = tokenFrom(lastEmail("verify").link!);
    const tampered = token.slice(0, -2) + (token.endsWith("A") ? "BB" : "AA");
    expect((await actions.completeRegistration(tampered)).success).toBe(false);
    expect(openToken("password-reset", token)).toBeNull();
    const expired = sealToken("registration", { email: "x@example.com" }, -1);
    expect((await actions.completeRegistration(expired)).success).toBe(false);
  });

  it("enforces the password policy server-side", async () => {
    expect((await actions.register({ ...input, password: "weak" })).success).toBe(false);
  });
});

describe("password reset", () => {
  it("answers the same for unknown emails and sends nothing", async () => {
    expect(await actions.requestPasswordReset({ email: "personne@example.com" })).toEqual({ success: true });
    expect(state.emails).toHaveLength(0);
  });

  it("resets the password once, revokes API tokens and resets the counter", async () => {
    const userId = await seedUser();
    expect(await actions.requestPasswordReset({ email: "Lecteur@Example.com" })).toEqual({ success: true });
    const { link } = lastEmail("reset");
    expect(link!.startsWith("https://devousamoi.test/auth/new-password?")).toBe(true);
    const token = tokenFrom(link!);

    const reset = { token, password: "Nouveau!Mot2", password_confirmation: "Nouveau!Mot2" };
    expect(await actions.resetPassword(reset)).toEqual({ success: true });
    const [user] = await db().select().from(users).where(eq(users.userId, userId));
    expect(await verifyPassword(user.password, "Nouveau!Mot2")).toBe(true);
    expect(user.resendCount).toBe(0);
    expect(await db().select().from(authAccessTokens)).toHaveLength(0);
    expect(lastEmail("changed").to).toBe("lecteur@example.com");

    // Single use: the password changed, so the same link no longer works.
    const again = { ...reset, password: "Encore!Mot3", password_confirmation: "Encore!Mot3" };
    expect((await actions.resetPassword(again)).success).toBe(false);
  });

  it("rate-limits repeated requests like the API did", async () => {
    await seedUser();
    await actions.requestPasswordReset({ email: "lecteur@example.com" });
    const second = await actions.requestPasswordReset({ email: "lecteur@example.com" });
    expect(second.success).toBe("warning");
    expect(state.emails.filter((e) => e.kind === "reset")).toHaveLength(1);
  });

  it("refuses reusing the current password", async () => {
    await seedUser();
    await actions.requestPasswordReset({ email: "lecteur@example.com" });
    const token = tokenFrom(lastEmail("reset").link!);
    const result = await actions.resetPassword({ token, password: "Ancien!Mot1", password_confirmation: "Ancien!Mot1" });
    expect(result.success).toBe(false);
  });
});

describe("change password", () => {
  it("requires a session", async () => {
    expect((await actions.changePassword({ password: "Ancien!Mot1", newPassword: "Nouveau!Mot2" })).success).toBe(false);
  });

  it("checks the current password and refuses reusing it", async () => {
    state.session = { user: { userId: await seedUser() } };
    expect((await actions.changePassword({ password: "Mauvais!1", newPassword: "Nouveau!Mot2" })).success).toBe(false);
    expect((await actions.changePassword({ password: "Ancien!Mot1", newPassword: "Ancien!Mot1" })).success).toBe(false);
  });

  it("changes the password and revokes API tokens", async () => {
    const userId = await seedUser();
    state.session = { user: { userId } };
    expect(await actions.changePassword({ password: "Ancien!Mot1", newPassword: "Nouveau!Mot2" })).toEqual({ success: true });
    expect(await checkCredentials("lecteur@example.com", "Nouveau!Mot2")).not.toBeNull();
    expect(await checkCredentials("lecteur@example.com", "Ancien!Mot1")).toBeNull();
    expect(await db().select().from(authAccessTokens)).toHaveLength(0);
  });
});

describe("throttling", () => {
  const signup = (email: string) =>
    actions.register({ firstName: "Nouvelle", lastName: "Lectrice", email, password: "Bonjour!Mot1" });

  it("sends at most 3 sign-up emails per address an hour", async () => {
    for (let i = 0; i < 3; i++) expect((await signup("spam@example.com")).success).toBe(true);
    const blocked = await signup("spam@example.com");
    expect(blocked.success).toBe("warning");
    expect(state.emails.filter((e) => e.kind === "verify")).toHaveLength(3);
  });

  it("caps sign-up emails per IP across addresses", async () => {
    for (let i = 0; i < 10; i++) expect((await signup(`cible${i}@example.com`)).success).toBe(true);
    expect((await signup("encore@example.com")).success).toBe("warning");
    state.ip = "198.51.100.9";
    expect((await signup("encore@example.com")).success).toBe(true);
  });

  it("caps reset requests per IP even for unknown addresses", async () => {
    for (let i = 0; i < 10; i++) expect((await actions.requestPasswordReset({ email: `inconnu${i}@example.com` })).success).toBe(true);
    expect((await actions.requestPasswordReset({ email: "inconnu@example.com" })).success).toBe("warning");
  });
});

describe("bot checks on signed-out forms", () => {
  const signup = (extra: object = {}) =>
    actions.register({ firstName: "Nouvelle", lastName: "Lectrice", email: "nouvelle@example.com", password: "Bonjour!Mot1", ...extra });

  it("answers a filled honeypot like a success but sends nothing", async () => {
    expect(await signup({ website: "http://spam.example" })).toEqual({ success: true });
    expect(await actions.requestPasswordReset({ email: "lecteur@example.com", website: "x" })).toEqual({ success: true });
    expect(state.emails).toHaveLength(0);
  });

  it("treats a form sent within a second of opening as a bot", async () => {
    expect(await signup({ openedAt: Date.now() - 500 })).toEqual({ success: true });
    expect(state.emails).toHaveLength(0);
  });

  it("refuses when Turnstile fails, on every form", async () => {
    state.turnstileOk = false;
    expect((await signup()).success).toBe(false);
    expect((await actions.requestPasswordReset({ email: "lecteur@example.com" })).success).toBe(false);
    expect((await actions.resetPassword({ token: "t", password: "Nouveau!Mot2" })).success).toBe(false);
    expect(state.emails).toHaveLength(0);
  });
});
