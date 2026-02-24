import AppLayout from "@/components/layouts/AppLayout";
import ArticlePageContent from "./ArticlePageContent";
import { Read } from "@/types/types";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/reads/${slug}/related`,
    {
      method: "GET",
    },
  );
  const response = await request.json();
  const read: Read = response.read;
  const relateds: Read[] = response.related;
  return (
    <AppLayout>
      <ArticlePageContent read={read} relateds={relateds} />
    </AppLayout>
  );
}
