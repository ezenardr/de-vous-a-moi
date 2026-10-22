import "server-only";

// Cloudflare Turnstile (bot check on the newsletter form). Production needs TURNSTILE_SECRET_KEY
// (and NEXT_PUBLIC_TURNSTILE_SITE_KEY for the widget); without it, sign-ups are refused (fail closed).
// Locally, Cloudflare's documented always-pass test secret is used when no key is set.
const TEST_SECRET = "1x0000000000000000000000000000000AA";

function secret() {
  if (process.env.TURNSTILE_SECRET_KEY) return process.env.TURNSTILE_SECRET_KEY;
  return process.env.VERCEL_ENV === "production" ? undefined : TEST_SECRET;
}

export async function verifyTurnstile(token: unknown, ip?: string): Promise<boolean> {
  const key = secret();
  if (!key) {
    console.error("TURNSTILE_SECRET_KEY is not set: refusing the request");
    return false;
  }
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: key, response: token, ...(ip && ip !== "unknown" ? { remoteip: ip } : {}) }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    console.error("turnstile verification failed", error);
    return false;
  }
}
