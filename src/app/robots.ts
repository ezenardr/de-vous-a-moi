import { MetadataRoute } from "next";

// Private and personal pages stay out of search; search results pages are thin duplicates.
// The same pages carry a noindex robots tag in their metadata.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/author/", "/auth/", "/saved", "/search", "/newsletter/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}
