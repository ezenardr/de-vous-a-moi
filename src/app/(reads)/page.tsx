export const dynamic = "force-dynamic";

import AppLayout from "@/components/layouts/AppLayout";
import { EmptyState } from "@/components/ds/EmptyState";
import { PageHeader } from "@/components/ds/PageHeader";
import { ReadCard } from "@/components/ds/ReadCard";
import { SectionHeader } from "@/components/ds/SectionHeader";
import { FadeUp, RevealOnScroll } from "@/components/motion/Reveal";
import { auth } from "@/lib/auth";
import { getHomeReads, getSavedReadIds, markSaved } from "@/server/queries/reads";

// Figma "Reads": desktop 153:10581, mobile 153:31942.
// Desktop body: 80px header, then 25px down a 1130px column: featured row (735 + 20 + 375),
// 25px, "Latest reads" (title row, 20px, 3 columns with 20px gaps).
// Mobile body: header 15px from the top, content 20px below it, single column with 20px gaps.
export default async function ReadPage() {
  const session = await auth();
  const [{ latest, featured }, saved] = await Promise.all([getHomeReads(), getSavedReadIds(session?.user?.userId)]);
  const [first, second] = markSaved(featured, saved);
  const featuredIds = new Set([first?.readId, second?.readId]);
  const recents = markSaved(latest, saved).filter((read) => !featuredIds.has(read.readId));

  return (
    <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
      <PageHeader title={<h1>Lectures</h1>} />
      <div className="flex flex-col gap-8 pt-8 lg:gap-[2.5rem] lg:px-8 lg:pt-[2.5rem] lg:pb-8">
        {latest.length === 0 ? (
          <EmptyState>Aucun article n&apos;est encore publié. Revenez bientôt !</EmptyState>
        ) : (
          <>
            {first && (
              <section aria-label="À la une" className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,73.5fr)_minmax(0,37.5fr)] lg:items-start">
                <FadeUp>
                  <ReadCard read={first} variant="hero" priority />
                </FadeUp>
                {second && (
                  <FadeUp index={1}>
                    <ReadCard read={second} variant="tall" priority />
                  </FadeUp>
                )}
              </section>
            )}
            {recents.length > 0 && (
              <section className="flex flex-col gap-8">
                <RevealOnScroll>
                  <SectionHeader title="Les plus récents" href="/reads" />
                </RevealOnScroll>
                <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {recents.map((read, i) => (
                    <RevealOnScroll as="li" key={read.readId} index={i % 3}>
                      <ReadCard read={read} />
                    </RevealOnScroll>
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
