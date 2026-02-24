import AppLayout from "@/components/layouts/AppLayout";
import { auth } from "@/lib/auth";
import { userPolicy } from "@/lib/role/userPolicy";
import { redirect } from "next/navigation";
import React from "react";
import PreviewPageContent from "./PreviewPageContent";

export default async function Preview({
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
    redirect("/author/reads");
  }
  return (
    <AppLayout>
      <PreviewPageContent draft={response.read} author={response.author} />
    </AppLayout>
  );
}
