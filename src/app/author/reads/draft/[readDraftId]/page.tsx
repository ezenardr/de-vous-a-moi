export const dynamic = "force-dynamic";

import AppLayout from "@/components/layouts/AppLayout";
import NewArticlePageContent from "./NewArticlePageContent";
import { redirect } from "next/navigation";
import { authorOrRedirect } from "@/server/auth/guards";
import { getOwnDraft } from "@/server/queries/studio";

export default async function NewArticle({
  params,
}: {
  params: Promise<{ readDraftId: string }>;
}) {
  const readDraftId = (await params).readDraftId;
  const user = await authorOrRedirect();
  const draft = await getOwnDraft(readDraftId, user.userId).catch(() => null);
  if (!draft) {
    redirect("/author/reads");
  }
  return (
    <AppLayout>
      <NewArticlePageContent read={draft} />
    </AppLayout>
  );
}
