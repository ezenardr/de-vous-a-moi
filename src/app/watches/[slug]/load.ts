import "server-only";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { extractIdFromSlug, slugify } from "@/lib/Slugify";
import { getWatchPage } from "@/server/queries/watches";

// Shared by layout.tsx, page.tsx and generateMetadata within one request.
// Unknown videos 404 and outdated slugs (title changed) 308 to the canonical URL.
export const loadWatch = cache(async (slug: string) => {
  let watchId: string;
  try {
    watchId = extractIdFromSlug(slug);
  } catch {
    notFound();
  }
  const data = await getWatchPage(watchId);
  if (!data) notFound();
  const canonical = slugify(data.watch.title, watchId);
  if (decodeURIComponent(slug) !== canonical) permanentRedirect(`/watches/${canonical}`);
  return { ...data, canonical };
});
