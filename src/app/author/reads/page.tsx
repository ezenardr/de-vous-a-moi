export const dynamic = "force-dynamic";

import AppLayout from "@/components/layouts/AppLayout";
import { PageHeader } from "@/components/ds/PageHeader";
import { StatTiles } from "@/components/ds/StatTiles";
import { FadeUp } from "@/components/motion/Reveal";
import { authorOrRedirect } from "@/server/auth/guards";
import { getStudioReads } from "@/server/queries/studio";
import NewReadButton from "./NewReadButton";
import { StudioReads, type StudioReadsTab } from "./StudioReads";

export const metadata = { title: "Mes articles | De vous à moi" };

const TABS: StudioReadsTab[] = ["published", "scheduled", "drafts"];

// Author studio (no Figma): the site's page header with "Nouvel article", the totals of the published
// articles, then published / scheduled / drafts. Per-author data, read fresh.
export default async function AuthorReadsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [user, { tab }] = await Promise.all([authorOrRedirect(), searchParams]);
  const { items, drafts, totals } = await getStudioReads(user.userId);
  const initialTab = TABS.includes(tab as StudioReadsTab) ? (tab as StudioReadsTab) : "published";

  return (
    <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
      <PageHeader title={<h1>Mes articles</h1>} search={false}>
        <NewReadButton />
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
          <StudioReads items={items} drafts={drafts} initialTab={initialTab} />
        </FadeUp>
      </div>
    </AppLayout>
  );
}
