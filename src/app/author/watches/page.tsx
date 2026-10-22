export const dynamic = "force-dynamic";

import { ButtonLink } from "@/components/ds/Button";
import { PageHeader } from "@/components/ds/PageHeader";
import { StatTiles } from "@/components/ds/StatTiles";
import { VideoFillIcon } from "@/components/icons/mingcute";
import AppLayout from "@/components/layouts/AppLayout";
import { FadeUp } from "@/components/motion/Reveal";
import { authorOrRedirect } from "@/server/auth/guards";
import { getStudioWatches } from "@/server/queries/studio";
import { StudioWatches, type StudioWatchesTab } from "./StudioWatches";

export const metadata = { title: "Mes vidéos | De vous à moi" };

// Author studio, videos: "Nouvelle vidéo", the totals of the published videos, then published / scheduled.
export default async function AuthorWatchesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [user, { tab }] = await Promise.all([authorOrRedirect(), searchParams]);
  const { items, totals } = await getStudioWatches(user.userId);
  const initialTab: StudioWatchesTab = tab === "scheduled" ? "scheduled" : "published";

  return (
    <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
      <PageHeader title={<h1>Mes vidéos</h1>} search={false}>
        <ButtonLink href="/author/watches/create" icon={VideoFillIcon}>
          Nouvelle vidéo
        </ButtonLink>
      </PageHeader>
      <div className="flex flex-col gap-[3rem] lg:gap-[2.5rem] lg:px-8 lg:pt-[2.5rem] lg:pb-8">
        <FadeUp>
          <StatTiles
            compact
            stats={[
              { label: "vues", value: totals.views },
              { label: "j'aime", value: totals.likes },
              { label: "commentaires", value: totals.comments },
              { label: "partages", value: totals.shares },
              { label: "enregistrements", value: totals.saves },
            ]}
          />
        </FadeUp>
        <FadeUp index={1}>
          <StudioWatches items={items} initialTab={initialTab} />
        </FadeUp>
      </div>
    </AppLayout>
  );
}
