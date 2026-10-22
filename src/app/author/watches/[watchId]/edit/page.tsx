export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import z from "zod";
import AppLayout from "@/components/layouts/AppLayout";
import { authorOrRedirect } from "@/server/auth/guards";
import { getOwnWatch } from "@/server/queries/studio";
import { WatchForm } from "../../WatchForm";

export const metadata = { title: "Modifier | Mes vidéos" };

// Editing a published (or scheduled) video. Someone else's video is a 404; SaveWatch checks again.
export default async function EditWatchPage({ params }: { params: Promise<{ watchId: string }> }) {
  const { watchId } = await params;
  const user = await authorOrRedirect();
  if (!z.uuid().safeParse(watchId).success) notFound();
  const watch = await getOwnWatch(watchId, user.userId);
  if (!watch) notFound();
  return (
    <AppLayout className="gap-[1.5rem] pt-[1.5rem] lg:gap-0 lg:p-0">
      <WatchForm
        watch={{
          id: watch.watchId,
          title: watch.title,
          description: watch.description,
          videoUrl: watch.videoUrl,
          imageUrl: watch.imageUrl,
        }}
      />
    </AppLayout>
  );
}
