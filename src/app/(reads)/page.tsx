export const dynamic = "force-dynamic";

import AppLayout from "@/components/layouts/AppLayout";
import { EmptyState } from "@/components/ds/EmptyState";
import { PageHeader } from "@/components/ds/PageHeader";
import { ReadCard } from "@/components/ds/ReadCard";
import { SectionHeader } from "@/components/ds/SectionHeader";
import { FadeUp, RevealOnScroll } from "@/components/motion/Reveal";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { websiteJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { getHomeReads, getSavedReadIds, markSaved } from "@/server/queries/reads";

// The home page keeps the site title and description (root layout); only the canonical is added.
export const metadata = { alternates: { canonical: "/" } };

// Figma "Reads": desktop 153:10581 / full 153:13775, mobile 153:31942 / full 155:33163.
// Desktop body: 80px header, then 25px down a 1130px column: featured row (735 + 20 + 375),
// 25px, "Latest reads" (title, 20px, 3 x 2 cards), 25px, "Reads you might like" (3 cards, then 2 wider).
// Mobile: header 15px from the top, content 20px below, one column; 30px between featured and latest.
export default async function ReadPage() {
  const session = await auth();
  const [home, saved] = await Promise.all([getHomeReads(), getSavedReadIds(session?.user?.userId)]);
  const [first, second] = markSaved(home.featured, saved);
  const latest = markSaved(home.latest, saved);
  const mightLike = markSaved(home.mightLike, saved);
  const empty = !first && latest.length === 0;

  return (
    <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
      <JsonLd data={websiteJsonLd()} />
      <PageHeader title={<h1>Lectures</h1>} />
      <div className="flex flex-col gap-[3rem] lg:gap-[2.5rem] lg:px-8 lg:pt-[2.5rem] lg:pb-8">
        {empty ? (
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
            {latest.length > 0 && (
              <section className="flex flex-col gap-8">
                <RevealOnScroll>
                  <SectionHeader title="Les plus récents" href="/reads" />
                </RevealOnScroll>
                <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {latest.map((read, i) => (
                    <RevealOnScroll as="li" key={read.readId} index={i % 3}>
                      <ReadCard read={read} />
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
                {/* First row: three cards; second row: two wider cards (555px each in Figma). */}
                <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
                  {mightLike.map((read, i) => (
                    <RevealOnScroll
                      as="li"
                      key={read.readId}
                      index={i < 3 ? i : i - 3}
                      className={cn(i < 3 ? "lg:col-span-2" : "lg:col-span-3")}
                    >
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
