export const dynamic = "force-dynamic";

import AppLayout from "@/components/layouts/AppLayout";
import { Breadcrumb } from "@/components/ds/Breadcrumb";
import { EmptyState } from "@/components/ds/EmptyState";
import { PageHeader } from "@/components/ds/PageHeader";
import { SectionHeader } from "@/components/ds/SectionHeader";
import { VideoCard } from "@/components/ds/VideoCard";
import { FadeUp, RevealOnScroll } from "@/components/motion/Reveal";
import { auth } from "@/lib/auth";
import { getAllWatchesCached, getSavedWatchIds, markWatchesSaved } from "@/server/queries/watches";
import { breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = {
  title: "Toutes les vidéos",
  description: "Toutes les vidéos de De vous à moi, de la plus récente à la plus ancienne.",
  alternates: { canonical: "/watches/all" },
};

// No Figma frame for "All videos": same layout as "Reads › All reads" (153:11005).
export default async function WatchAllPage() {
  const session = await auth();
  const [all, saved] = await Promise.all([getAllWatchesCached(), getSavedWatchIds(session?.user?.userId)]);
  const watches = markWatchesSaved(all, saved);

  return (
    <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
      <JsonLd data={breadcrumbJsonLd([{ name: "Vidéos", path: "/watches" }, { name: "Toutes les vidéos", path: "/watches/all" }])} />
      <PageHeader title={<Breadcrumb parent={{ label: "Vidéos", href: "/watches" }} current="Toutes les vidéos" />} />
      <section className="flex flex-col gap-8 lg:px-8 lg:pt-[2.5rem] lg:pb-8">
        <FadeUp>
          <SectionHeader title="Toutes les vidéos" />
        </FadeUp>
        {watches.length === 0 ? (
          <EmptyState>Aucune vidéo n&apos;est encore publiée. Revenez bientôt !</EmptyState>
        ) : (
          <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {watches.map((watch, i) =>
              i < 6 ? (
                <FadeUp as="li" key={watch.watchId} index={i}>
                  <VideoCard watch={watch} priority={i < 3} />
                </FadeUp>
              ) : (
                <RevealOnScroll as="li" key={watch.watchId} index={i % 3}>
                  <VideoCard watch={watch} />
                </RevealOnScroll>
              ),
            )}
          </ul>
        )}
      </section>
    </AppLayout>
  );
}
