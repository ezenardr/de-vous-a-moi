import "server-only";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getCategoryReads } from "@/server/queries/reads";

// Shared by layout.tsx, page.tsx and generateMetadata within one request.
// A category exists while it has public reads; otherwise 404.
export const loadCategory = cache(async (slug: string) => {
  let category: string;
  try {
    category = decodeURIComponent(slug);
  } catch {
    notFound();
  }
  const reads = await getCategoryReads(category);
  if (reads.length === 0) notFound();
  return { category, reads };
});
