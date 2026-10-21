export const dynamic = "force-dynamic";

import AppLayout from "@/components/layouts/AppLayout";
import { authorOrRedirect } from "@/server/auth/guards";
import { getOwnRead } from "@/server/queries/studio";
import { redirect } from "next/navigation";
import EditReadPageContent from "./EditReadPageContent";

export default async function EditRead({
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
      <EditReadPageContent read={read} />
    </AppLayout>
  );
}
