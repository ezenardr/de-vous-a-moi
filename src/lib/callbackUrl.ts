// Where to go after signing in. Only same-site paths are accepted ("/x", not "//evil.com" or
// "/\evil.com"), and never back into /auth, which would loop.
export function safeCallbackUrl(value: unknown, fallback = "/"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (value === "/auth" || value.startsWith("/auth/")) return fallback;
  return value;
}

export const loginHref = (callbackUrl?: string) =>
  callbackUrl && callbackUrl !== "/" ? `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/auth/login";
