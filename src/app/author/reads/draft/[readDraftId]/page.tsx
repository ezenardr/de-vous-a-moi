export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import z from "zod";
import AppLayout from "@/components/layouts/AppLayout";
import { ArticleEditor } from "@/components/studio/ArticleEditor";
import { authorOrRedirect } from "@/server/auth/guards";
import { getOwnDraft } from "@/server/queries/studio";

export const metadata = { title: "Brouillon | Mes articles" };

// Editing one of the signed-in author's drafts (anyone else's is a 404).
export default async function DraftPage({ params }: { params: Promise<{ readDraftId: string }> }) {
  const { readDraftId } = await params;
  const user = await authorOrRedirect();
  if (!z.uuid().safeParse(readDraftId).success) notFound();
  const draft = await getOwnDraft(readDraftId, user.userId);
  if (!draft) notFound();
  return (
    <AppLayout className="gap-[1.5rem] pt-[1.5rem] lg:gap-0 lg:p-0">
      <ArticleEditor
        mode="draft"
        article={{
          id: draft.readDraftId,
          title: draft.title ?? "",
          description: draft.description ?? "",
          category: draft.category ?? "",
          content: draft.content ?? "",
          imageUrl: draft.imageUrl,
        }}
      />
    </AppLayout>
  );
}
