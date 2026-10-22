export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import AppLayout from "@/components/layouts/AppLayout";
import { ArticleEditor } from "@/components/studio/ArticleEditor";
import { getOwnRead } from "@/server/queries/studio";
import { loadStudioRead } from "../load";

export const metadata = { title: "Modifier | Mes articles" };

// Editing a published (or scheduled) read; the [readId] layout already checked it's the author's.
export default async function EditReadPage({ params }: { params: Promise<{ readId: string }> }) {
  const { user, item } = await loadStudioRead((await params).readId);
  const read = await getOwnRead(item.id, user.userId);
  if (!read) notFound();
  return (
    <AppLayout className="gap-[1.5rem] pt-[1.5rem] lg:gap-0 lg:p-0">
      <ArticleEditor
        mode="read"
        article={{
          id: read.readId,
          title: read.title,
          description: read.description,
          category: read.category,
          content: read.content,
          imageUrl: read.imageUrl,
        }}
      />
    </AppLayout>
  );
}
