import AppLayout from "@/components/layouts/AppLayout";
import ArticlePageContent from "./ArticlePageContent";
import { Read } from "@/types/types";
import { Metadata } from "next";
import { extractIdFromSlug } from "@/lib/Slugify";

async function getRead(id: string): Promise<{ read: Read; related: Read[] }> {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/reads/${id}/related`,
    { method: "GET" },
  );
  return request.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = (await params).slug;
  const readId = extractIdFromSlug(slug);
  const { read } = await getRead(readId);

  return {
    title: read.title,
    description: read.description,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const readId = extractIdFromSlug(slug);
  const { read, related: relateds } = await getRead(readId);
  return (
    <AppLayout>
      <ArticlePageContent read={read} relateds={relateds} />
    </AppLayout>
  );
}
