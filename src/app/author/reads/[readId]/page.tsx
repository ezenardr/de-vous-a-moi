import AppLayout from "@/components/layouts/AppLayout";
import { auth } from "@/lib/auth";
import { userPolicy } from "@/lib/role/userPolicy";
import { redirect } from "next/navigation";
import AuthorReadPageContent from "./AuthorReadPageContent";
import { Read } from "@/types/types";

export default async function AuthorReadPage({
  params,
}: {
  params: Promise<{ readId: string }>;
}) {
  const readId = (await params).readId;
  if (!readId) {
    redirect("/author/reads");
  }
  const session = await auth();
  const authorized = await userPolicy.createReads(session?.user.userId ?? "");
  if (!authorized) {
    redirect("/");
  }
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/reads/${readId}`,
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
  const read: Read = response.read;
  const author = response.author;
  return (
    <AppLayout>
      <AuthorReadPageContent read={read} author={author} />
    </AppLayout>
  );
}
