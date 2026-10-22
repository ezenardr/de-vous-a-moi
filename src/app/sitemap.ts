import { MetadataRoute } from "next";
import { categoryHref } from "@/components/ds/CategoryTile";
import { slugify } from "@/lib/Slugify";
import { getCategoriesCached, getSitemapReads } from "@/server/queries/reads";
import { getSitemapWatches } from "@/server/queries/watches";

export const dynamic = "force-dynamic";

// Every public page: the lists, About, each category, then every public read and video
// (archived and scheduled items are left out by the queries).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL;
  const [reads, watches, categories] = await Promise.all([getSitemapReads(), getSitemapWatches(), getCategoriesCached()]);
  const now = new Date();

  const articleUrls: MetadataRoute.Sitemap = reads.map((read) => ({
    url: `${base}/reads/${slugify(read.title, read.readId)}`,
    lastModified: read.updatedAt ?? read.createdAt ?? undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const watchUrls: MetadataRoute.Sitemap = watches.map((watch) => ({
    url: `${base}/watches/${slugify(watch.title, watch.watchId)}`,
    lastModified: watch.updatedAt ?? watch.createdAt ?? undefined,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const categoryUrls: MetadataRoute.Sitemap = categories.map(({ category }) => ({
    url: `${base}${categoryHref(category)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    { url: `${base}`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/reads`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/watches`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/watches/all`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    ...categoryUrls,
    ...articleUrls,
    ...watchUrls,
  ];
}
