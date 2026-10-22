export const dynamic = "force-dynamic";

import AppLayout from "@/components/layouts/AppLayout";
import { EmptyState } from "@/components/ds/EmptyState";
import { PageHeader } from "@/components/ds/PageHeader";
import { SectionHeader } from "@/components/ds/SectionHeader";
import { VideoCard } from "@/components/ds/VideoCard";
import { FadeUp, RevealOnScroll } from "@/components/motion/Reveal";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { getSavedWatchIds, getWatchesHome, markWatchesSaved } from "@/server/queries/watches";

export const metadata = { title: "Vidéos | De vous à moi" };

// Figma "Watches": desktop 153:14008 / full 153:14223, mobile 156:41983 / full 156:42124 (list part).
// Same grid as the reads home: featured row (735 + 20 + 375), 25px, "Latest releases" (3 x 2),
// 25px, "Videos you might like" (3 cards, then 2 wider). Mobile: one column, 30px between blocks.
export default async function WatchesPage() {
  const session = await auth();
  const [home, saved] = await Promise.all([getWatchesHome(), getSavedWatchIds(session?.user?.userId)]);
  const [first, second] = markWatchesSaved(home.featured, saved);
  const latest = markWatchesSaved(home.latest, saved);
  const mightLike = markWatchesSaved(home.mightLike, saved);

  return (
    <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
      <PageHeader title={<h1>Vidéos</h1>} />
      <div className="flex flex-col gap-[3rem] lg:gap-[2.5rem] lg:px-8 lg:pt-[2.5rem] lg:pb-8">
        {!first ? (
          <EmptyState>Aucune vidéo n&apos;est encore publiée. Revenez bientôt !</EmptyState>
        ) : (
          <>
            <section aria-label="À la une" className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,73.5fr)_minmax(0,37.5fr)] lg:items-start">
              <FadeUp>
                <VideoCard watch={first} variant="hero" priority />
              </FadeUp>
              {second && (
                <FadeUp index={1}>
                  <VideoCard watch={second} variant="tall" priority />
                </FadeUp>
              )}
            </section>
            {latest.length > 0 && (
              <section className="flex flex-col gap-8">
                <RevealOnScroll>
                  <SectionHeader title="Les plus récentes" href="/watches/all" />
                </RevealOnScroll>
                <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {latest.map((watch, i) => (
                    <RevealOnScroll as="li" key={watch.watchId} index={i % 3}>
                      <VideoCard watch={watch} />
                    </RevealOnScroll>
                  ))}
                </ul>
              </section>
            )}
            {mightLike.length > 0 && (
              <section className="flex flex-col gap-8">
                <RevealOnScroll>
                  <SectionHeader title="Vous aimerez aussi" />
                </RevealOnScroll>
                <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
                  {mightLike.map((watch, i) => (
                    <RevealOnScroll
                      as="li"
                      key={watch.watchId}
                      index={i < 3 ? i : i - 3}
                      className={cn(i < 3 ? "lg:col-span-2" : "lg:col-span-3")}
                    >
                      <VideoCard watch={watch} />
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
