export const dynamic = "force-dynamic";

import AppLayout from "@/components/layouts/AppLayout";
import { EmptyState } from "@/components/ds/EmptyState";
import { PageHeader } from "@/components/ds/PageHeader";
import { ReadCard } from "@/components/ds/ReadCard";
import { SectionHeader } from "@/components/ds/SectionHeader";
import { auth } from "@/lib/auth";
import { getFeaturedReads, getLatestReads } from "@/server/queries/reads";

// Figma "Reads" (153:10581): two featured reads, then the latest reads in a 3-column grid.
export default async function ReadPage() {
  const session = await auth();
  const viewerId = session?.user?.userId;
  const [latest, featured] = await Promise.all([getLatestReads({ limit: 15, viewerId }), getFeaturedReads(viewerId)]);
  const [first, second] = featured;
  const featuredIds = new Set(featured.slice(0, 2).map((read) => read.readId));
  const recents = latest.filter((read) => !featuredIds.has(read.readId));

  return (
    <AppLayout className="lg:p-0">
      <PageHeader title={<h1>Lectures</h1>} />
      <div className="flex flex-col gap-[2.5rem] lg:px-8 lg:pb-8">
        {latest.length === 0 ? (
          <EmptyState>Aucun article n&apos;est encore publié. Revenez bientôt !</EmptyState>
        ) : (
          <>
            {first && (
              <section aria-label="À la une" className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,735fr)_minmax(0,375fr)] lg:gap-[2rem]">
                <ReadCard read={first} variant="hero" priority />
                {second && <ReadCard read={second} variant="tall" priority />}
              </section>
            )}
            {recents.length > 0 && (
              <section className="flex flex-col gap-[2rem]">
                <SectionHeader title="Les plus récents" href="/reads" />
                <ul className="grid grid-cols-1 gap-[2rem] md:grid-cols-2 lg:grid-cols-3">
                  {recents.map((read) => (
                    <li key={read.readId}>
                      <ReadCard read={read} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
