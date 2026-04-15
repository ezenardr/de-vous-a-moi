import { slugify } from "@/lib/Slugify";
import { Read } from "@/types/types";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const request = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reads`, {
    method: "GET",
  });
  const response = await request.json();
  const reads: Read[] = response.reads;

  const articleUrls: MetadataRoute.Sitemap = reads.map((read) => ({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/reads/${slugify(read.title, read.readId)}`,
    lastModified: new Date(read.updatedAt ?? read.createdAt),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    {
      url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/reads`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/saved`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    ...articleUrls,
  ];
}
