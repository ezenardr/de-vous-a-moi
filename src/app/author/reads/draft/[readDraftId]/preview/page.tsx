export const dynamic = "force-dynamic";

import AppLayout from "@/components/layouts/AppLayout";
import { redirect } from "next/navigation";
import React from "react";
import PreviewPageContent from "./PreviewPageContent";
import { authorCard, authorOrRedirect } from "@/server/auth/guards";
import { getOwnDraft } from "@/server/queries/studio";

export default async function Preview({
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
      <PreviewPageContent draft={draft} author={authorCard(user)} />
    </AppLayout>
  );
}
