import { describe, expect, it } from "vitest";
import { nameSchema, personNameSchema } from "./auth";

const name = personNameSchema("Prénom");

describe("person names", () => {
  it("accepts real names in any language and tidies spaces", () => {
    for (const ok of ["Marie Mirlène", "Jean-Pierre", "O’Brien", "D'Arcy", "Abigaïl", "RENÉ", "J.", "Ñúñez", "Zoë Saint-Éloi"]) {
      expect(name.safeParse(ok).success, ok).toBe(true);
    }
    expect(name.parse("  Sherlande   Coquillon ")).toBe("Sherlande Coquillon");
  });

  it("refuses digits, links, symbols, empty and over-long values", () => {
    for (const bad of ["", "   ", "Ada2", "Gagnez 500€", "http://spam.example", "www.spam.com", "<b>x</b>", "a@b.co", "-Ada", "Ada-", "x".repeat(61)]) {
      expect(name.safeParse(bad).success, bad).toBe(false);
    }
  });

  it("validates both fields of the profile form", () => {
    expect(nameSchema.safeParse({ firstName: "Ada", lastName: "Lovelace" }).success).toBe(true);
    expect(nameSchema.safeParse({ firstName: "Ada", lastName: "visit spam.com" }).success).toBe(false);
  });
});
