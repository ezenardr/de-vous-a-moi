import "server-only";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { extractIdFromSlug, slugify } from "@/lib/Slugify";
import { getArticle } from "@/server/queries/reads";

// Shared by layout.tsx, page.tsx and generateMetadata within one request.
// Unknown articles 404 and outdated slugs (title changed) 308 to the canonical URL.
export const loadArticle = cache(async (slug: string) => {
  let readId: string;
  try {
    readId = extractIdFromSlug(slug);
  } catch {
    notFound();
  }
  const article = await getArticle(readId);
  if (!article) notFound();
  const canonical = slugify(article.read.title, readId);
  if (decodeURIComponent(slug) !== canonical) permanentRedirect(`/reads/${canonical}`);
  return { article, canonical };
});
