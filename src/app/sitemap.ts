import { slugify } from "@/lib/Slugify";
import { getSitemapReads } from "@/server/queries/reads";
import { getSitemapWatches } from "@/server/queries/watches";
import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL;
  const [reads, watches] = await Promise.all([getSitemapReads(), getSitemapWatches()]);

  const articleUrls: MetadataRoute.Sitemap = reads.map((read) => ({
    url: `${base}/reads/${slugify(read.title, read.readId)}`,
    lastModified: read.updatedAt ?? read.createdAt ?? undefined,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const watchUrls: MetadataRoute.Sitemap = watches.map((watch) => ({
    url: `${base}/watches/${slugify(watch.title, watch.watchId)}`,
    lastModified: watch.updatedAt ?? watch.createdAt ?? undefined,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [
    { url: `${base}`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/reads`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/watches`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/categories`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    ...articleUrls,
    ...watchUrls,
  ];
}
