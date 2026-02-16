import AppLayout from "@/components/layouts/AppLayout";
import NewArticlePageContent from "./NewArticlePageContent";
import { redirect } from "next/navigation";
import { userPolicy } from "@/lib/role/userPolicy";
import { auth } from "@/lib/auth";

export default async function NewArticle({
  params,
}: {
  params: Promise<{ readDraftId: string }>;
}) {
  const readDraftId = (await params).readDraftId;
  if (!readDraftId) {
    redirect("/author/reads");
  }
  const session = await auth();
  const authorized = await userPolicy.createReads(session?.user.userId ?? "");
  if (!authorized) {
    redirect("/");
  }
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/reads/drafts/${readDraftId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
    },
  );
  const response = await request.json();
  if (!response.sucess === false) {
  }
  return (
    <AppLayout>
      <NewArticlePageContent read={response.read} />
    </AppLayout>
  );
}
