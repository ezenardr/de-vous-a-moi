import AppLayout from "@/components/layouts/AppLayout";
import ArticlePageContent from "./ArticlePageContent";
import { Read } from "@/types/types";
import { Metadata } from "next";

async function getRead(slug: string): Promise<{ read: Read; related: Read[] }> {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/reads/${slug}/related`,
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
  const { read } = await getRead(slug);

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
  const { read, related: relateds } = await getRead(slug);
  return (
    <AppLayout>
      <ArticlePageContent read={read} relateds={relateds} />
    </AppLayout>
  );
}
