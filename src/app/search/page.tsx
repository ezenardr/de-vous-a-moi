export const dynamic = "force-dynamic";

import AppLayout from "@/components/layouts/AppLayout";
import { EmptyState } from "@/components/ds/EmptyState";
import { PageHeader } from "@/components/ds/PageHeader";
import { ReadCard } from "@/components/ds/ReadCard";
import { SectionHeader } from "@/components/ds/SectionHeader";
import { SearchLineIcon } from "@/components/icons/mingcute";
import { FadeUp, RevealOnScroll } from "@/components/motion/Reveal";
import { auth } from "@/lib/auth";
import { getSavedReadIds, markSaved, searchReads } from "@/server/queries/reads";

export const metadata = { title: "Recherche | De vous à moi", robots: { index: false } };

// No Figma frame for search results: same layout as "All reads" (153:11005).
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const raw = (await searchParams).q;
  const query = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 100) ?? "";
  const session = await auth();
  const [found, saved] = await Promise.all([searchReads(query), getSavedReadIds(session?.user?.userId)]);
  const reads = markSaved(found, saved);

  return (
    <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
      <PageHeader title={<h1>Recherche</h1>} query={query} />
      <section className="flex flex-col gap-8 pt-8 lg:px-8 lg:pt-[2.5rem] lg:pb-8">
        {!query ? (
          <EmptyState icon={SearchLineIcon}>Tapez un mot-clé pour rechercher un article.</EmptyState>
        ) : reads.length === 0 ? (
          <EmptyState icon={SearchLineIcon}>Aucun article ne correspond à « {query} ».</EmptyState>
        ) : (
          <>
            <FadeUp>
              <SectionHeader title={`${reads.length} résultat${reads.length > 1 ? "s" : ""} pour « ${query} »`} />
            </FadeUp>
            <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {reads.map((read, i) =>
                i < 6 ? (
                  <FadeUp as="li" key={read.readId} index={i}>
                    <ReadCard read={read} />
                  </FadeUp>
                ) : (
                  <RevealOnScroll as="li" key={read.readId} index={i % 3}>
                    <ReadCard read={read} />
                  </RevealOnScroll>
                ),
              )}
            </ul>
          </>
        )}
      </section>
    </AppLayout>
  );
}
