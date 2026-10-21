export const dynamic = "force-dynamic";
import AppLayout from "@/components/layouts/AppLayout";
import ArticlePageContent from "./ArticlePageContent";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { extractIdFromSlug } from "@/lib/Slugify";
import { auth } from "@/lib/auth";
import { getReadWithRelated } from "@/server/queries/reads";

// Shared by generateMetadata and the page within one request.
const getRead = cache(async (slug: string) => {
  let readId: string;
  try {
    readId = extractIdFromSlug(slug);
  } catch {
    notFound();
  }
  const session = await auth();
  const data = await getReadWithRelated(readId, session?.user?.userId);
  if (!data) notFound();
  return data;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { read } = await getRead((await params).slug);
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
  const { read, related: relateds } = await getRead((await params).slug);
  return (
    <AppLayout>
      <ArticlePageContent read={read} relateds={relateds} />
    </AppLayout>
  );
}
