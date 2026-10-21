export const dynamic = "force-dynamic";

import AppLayout from "@/components/layouts/AppLayout";
import { redirect } from "next/navigation";
import AuthorReadPageContent from "./AuthorReadPageContent";
import { authorCard, authorOrRedirect } from "@/server/auth/guards";
import { getOwnRead } from "@/server/queries/studio";

export default async function AuthorReadPage({
  params,
}: {
  params: Promise<{ readId: string }>;
}) {
  const readId = (await params).readId;
  const user = await authorOrRedirect();
  const read = await getOwnRead(readId, user.userId).catch(() => null);
  if (!read) {
    redirect("/author/reads");
  }
  return (
    <AppLayout>
      <AuthorReadPageContent read={read} author={authorCard(user)} />
    </AppLayout>
  );
}
