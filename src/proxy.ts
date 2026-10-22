import { auth } from "@/lib/auth";

// Only the studio and admin go through here (see matcher), so public pages skip the session decode;
// /saved shows its own sign-in prompt. Visitors are sent to login and brought back via callbackUrl.
// Pages and actions still check roles themselves (authorOrRedirect, adminOrRedirect, requireUser…).
export default auth((req) => {
  if (req.auth) return;
  const { pathname, search, origin } = req.nextUrl;
  const loginUrl = new URL("/auth/login", origin);
  loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
  return Response.redirect(loginUrl);
});

export const config = {
  matcher: ["/author/:path*", "/admin/:path*"],
};
