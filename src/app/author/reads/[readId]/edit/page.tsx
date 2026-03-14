import AppLayout from "@/components/layouts/AppLayout";
import { auth } from "@/lib/auth";
import { userPolicy } from "@/lib/role/userPolicy";
import { Read } from "@/types/types";
import { redirect } from "next/navigation";
import EditReadPageContent from "./EditReadPageContent";

export default async function EditRead({
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
    `${process.env.NEXT_PUBLIC_API_URL}/author/reads/${readId}`,
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
  return (
    <AppLayout>
      <EditReadPageContent read={read} />
    </AppLayout>
  );
}
