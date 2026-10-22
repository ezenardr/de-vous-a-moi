import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/db", () => ({ db: {} }));

const { exchangeGoogleCode, verifiedGoogleProfile } = await import("./google");

const CLIENT = "client-123.apps.googleusercontent.com";
const now = Date.now();
const claims = {
  iss: "https://accounts.google.com",
  aud: CLIENT,
  exp: Math.floor(now / 1000) + 3600,
  email: "Lectrice@Gmail.com",
  email_verified: true,
  given_name: "Ada",
  family_name: "Lovelace",
};

describe("verifiedGoogleProfile", () => {
  it("accepts a fresh token for this client and lowercases the email", () => {
    expect(verifiedGoogleProfile(claims, CLIENT, now)).toEqual({ email: "lectrice@gmail.com", firstName: "Ada", lastName: "Lovelace" });
  });

  it.each([
    ["another client", { aud: "someone-else" }],
    ["another issuer", { iss: "https://evil.example" }],
    ["an expired token", { exp: Math.floor(now / 1000) - 1 }],
    ["an unverified email", { email_verified: false }],
    ["no email", { email: undefined }],
  ])("rejects %s", (_, override) => {
    expect(verifiedGoogleProfile({ ...claims, ...override }, CLIENT, now)).toBeNull();
  });
});

describe("exchangeGoogleCode", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const idToken = (body: object) => `h.${Buffer.from(JSON.stringify(body)).toString("base64url")}.s`;

  it("exchanges the popup code with redirect_uri postmessage and reads the ID token", async () => {
    vi.stubEnv("AUTH_GOOGLE_ID", CLIENT);
    vi.stubEnv("AUTH_GOOGLE_SECRET", "secret");
    const fetchMock = vi.fn(async () => Response.json({ id_token: idToken(claims) }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await exchangeGoogleCode("one-time-code")).toMatchObject({ email: "lectrice@gmail.com" });
    const body = new URLSearchParams(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(body.get("redirect_uri")).toBe("postmessage");
    expect(body.get("code")).toBe("one-time-code");
  });

  it("returns null when Google refuses the code or isn't configured", async () => {
    vi.stubEnv("AUTH_GOOGLE_ID", CLIENT);
    vi.stubEnv("AUTH_GOOGLE_SECRET", "secret");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("invalid_grant", { status: 400 })));
    expect(await exchangeGoogleCode("used-code")).toBeNull();
    vi.stubEnv("AUTH_GOOGLE_SECRET", "");
    expect(await exchangeGoogleCode("code")).toBeNull();
  });
});
