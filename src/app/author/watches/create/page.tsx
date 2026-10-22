export const dynamic = "force-dynamic";

import AppLayout from "@/components/layouts/AppLayout";
import { authorOrRedirect } from "@/server/auth/guards";
import { NewWatchForm } from "./NewWatchForm";

export const metadata = { title: "Nouvelle vidéo | Mes vidéos" };

// Authors only (readers go home); PublishWatch checks again on the server.
export default async function CreateWatchPage() {
  await authorOrRedirect();
  return (
    <AppLayout className="gap-[1.5rem] pt-[1.5rem] lg:gap-0 lg:p-0">
      <NewWatchForm />
    </AppLayout>
  );
}
