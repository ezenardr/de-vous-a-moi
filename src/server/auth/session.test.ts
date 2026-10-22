import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "@/test/db";

const state = vi.hoisted(() => ({ db: undefined as unknown, broken: false }));

vi.mock("@/server/db", () => ({
  get db() {
    if (state.broken) throw new Error("database unreachable");
    return state.db;
  },
}));

const { recheckToken, sessionToken, RECHECK_MS } = await import("./session");
const { users } = await import("@/server/db/schema");
const { hashPassword } = await import("./password");
const { findUserById } = await import("./users");

type Db = Awaited<ReturnType<typeof createTestDb>>;
const db = () => state.db as Db;

async function seedUser() {
  const userId = randomUUID();
  await db().insert(users).values({
    userId,
    firstName: "Lecteur",
    lastName: "Test",
    email: `${userId}@example.com`,
    password: await hashPassword("Ancien!Mot1"),
    role: "1",
    createdAt: new Date(),
  });
  return userId;
}

// A token as issued at sign-in, last checked longer ago than RECHECK_MS.
async function staleToken(userId: string) {
  return { ...sessionToken((await findUserById(userId))!), checkedAt: Date.now() - RECHECK_MS - 1000 };
}

beforeEach(async () => {
  state.broken = false;
  state.db = await createTestDb();
});

describe("session recheck", () => {
  it("leaves a recently checked token alone", async () => {
    const token = sessionToken((await findUserById(await seedUser()))!);
    expect(await recheckToken(token)).toBe(token);
  });

  it("ends sessions once the password has changed", async () => {
    const userId = await seedUser();
    const token = await staleToken(userId);
    await db().update(users).set({ password: await hashPassword("Nouveau!Mot2") }).where(eq(users.userId, userId));
    expect(await recheckToken(token)).toBeNull();
  });

  it("ends sessions of deleted users", async () => {
    const userId = await seedUser();
    const token = await staleToken(userId);
    await db().delete(users).where(eq(users.userId, userId));
    expect(await recheckToken(token)).toBeNull();
  });

  it("picks up a role change and resets the clock", async () => {
    const userId = await seedUser();
    const token = await staleToken(userId);
    await db().update(users).set({ role: "2" }).where(eq(users.userId, userId));
    const next = await recheckToken(token);
    expect(next?.role).toBe("2");
    expect(next?.checkedAt).toBeGreaterThan(token.checkedAt);
  });

  it("rechecks immediately when the client calls update()", async () => {
    const userId = await seedUser();
    const token = sessionToken((await findUserById(userId))!);
    await db().update(users).set({ firstName: "Nouveau" }).where(eq(users.userId, userId));
    expect((await recheckToken(token, true))?.firstName).toBe("Nouveau");
  });

  it("adopts a fingerprint for sessions issued before fingerprints existed", async () => {
    const userId = await seedUser();
    const { pwfp, ...legacy } = await staleToken(userId);
    expect(await recheckToken(legacy)).toMatchObject({ pwfp });
  });

  it("keeps the session when the database is unreachable", async () => {
    const token = await staleToken(await seedUser());
    state.broken = true;
    expect(await recheckToken(token)).toBe(token);
  });
});
