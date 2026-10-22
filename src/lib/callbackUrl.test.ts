import { describe, expect, it } from "vitest";
import { safeCallbackUrl } from "./callbackUrl";
import maskEmail from "./maskEmail";

describe("safeCallbackUrl", () => {
  it("keeps same-site paths", () => {
    expect(safeCallbackUrl("/saved")).toBe("/saved");
    expect(safeCallbackUrl("/reads/abc?x=1#y")).toBe("/reads/abc?x=1#y");
  });
  it("rejects other sites, auth pages and junk", () => {
    for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "/auth/login", "/auth", "javascript:alert(1)", undefined, 42]) {
      expect(safeCallbackUrl(bad)).toBe("/");
    }
  });
});

describe("maskEmail", () => {
  it("masks like Figma", () => {
    expect(maskEmail("rodolphezenard@gmail.com")).toBe("rodol****ard@gmail.com");
    expect(maskEmail("ab@x.fr")).toBe("a****@x.fr");
  });
});
