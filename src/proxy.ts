import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Define paths that don't require authentication
  const publicPaths = ["/auth", "/", "/watches", "/categories"];

  // Check if the current path matches any public path
  const isPublicPath = publicPaths.some((path) => {
    // Exact match for home page
    if (path === "/" && pathname === "/") return true;
    // StartsWith for other paths (e.g., /auth/login, /watches/123)
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  });

  // If user is NOT authenticated AND trying to access protected route
  if (!req.auth && !isPublicPath) {
    const loginUrl = new URL("/auth/login", req.nextUrl.origin);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
