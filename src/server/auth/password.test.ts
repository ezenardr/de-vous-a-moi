import { Scrypt } from "@adonisjs/hash/drivers/scrypt";
import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

// Same config as api.messarae.com/config/hash.ts
const adonis = new Scrypt({ cost: 16384, blockSize: 8, parallelization: 1, maxMemory: 33554432 });

describe("password hashing compatibility with AdonisJS", () => {
  it("verifies hashes produced by the Adonis API", async () => {
    const hashed = await adonis.make("Motdepasse!2024");
    expect(await verifyPassword(hashed, "Motdepasse!2024")).toBe(true);
    expect(await verifyPassword(hashed, "motdepasse!2024")).toBe(false);
  });

  it("produces hashes the Adonis API can verify", async () => {
    const hashed = await hashPassword("éàç Unicode ✓");
    expect(await adonis.verify(hashed, "éàç Unicode ✓")).toBe(true);
    expect(adonis.needsReHash(hashed)).toBe(false);
  });

  it("rejects malformed hashes without throwing", async () => {
    expect(await verifyPassword("not-a-hash", "x")).toBe(false);
    expect(await verifyPassword("$bcrypt$v=98$x$y", "x")).toBe(false);
  });
});
