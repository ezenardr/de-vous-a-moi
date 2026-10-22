export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import AppLayout from "@/components/layouts/AppLayout";
import { ArticleEngagement } from "@/components/article/ArticleEngagement";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import { ShareRead } from "@/components/article/ShareRead";
import { ViewTracker } from "@/components/article/ViewTracker";
import { AuthorChip } from "@/components/ds/AuthorChip";
import { Breadcrumb } from "@/components/ds/Breadcrumb";
import { SaveButton } from "@/components/ds/SaveButton";
import { SectionHeader } from "@/components/ds/SectionHeader";
import { VideoBadges, VideoCard } from "@/components/ds/VideoCard";
import { FadeUp, RevealOnScroll } from "@/components/motion/Reveal";
import { auth } from "@/lib/auth";
import { getSavedWatchIds, getWatchEngagement, markWatchesSaved } from "@/server/queries/watches";
import { loadWatch } from "./load";
import { VideoPlayer } from "./VideoPlayer";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { watch, canonical } = await loadWatch((await params).slug);
  return {
    title: watch.title,
    description: watch.description,
    alternates: { canonical: `/watches/${canonical}` },
    openGraph: { type: "video.other", title: watch.title, description: watch.description, images: [watch.imageUrl] },
  };
}

// Figma "Watches" video page: desktop 153:14661 (logged out) / 153:14779 (with comments), mobile
// 156:42124 / 156:44251. Desktop, 25px under the header, a 1130px column: 400px player, 15px, title +
// badges row, 10px, author (30px avatar); 35px; stats (400) | 30 | comments (700); 50px; "Recommended".
// Mobile: 350px player, title then badges, a divider before the stats, 25px between blocks.
// The description (not in Figma) sits under the author, as asked.
export default async function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { watch, recommended: others, canonical } = await loadWatch((await params).slug);
  const session = await auth();
  const viewerId = session?.user?.userId;
  const [engagement, saved] = await Promise.all([getWatchEngagement(watch.watchId, viewerId), getSavedWatchIds(viewerId)]);
  const recommended = markWatchesSaved(others, saved);
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/watches/${canonical}`;

  return (
    <AppLayout className="gap-[1.5rem] pt-[1.5rem] lg:gap-0 lg:p-0">
      <ViewTracker kind="watch" id={watch.watchId} />
      <ArticleHeader
        backHref="/watches"
        breadcrumb={<Breadcrumb parent={{ label: "Vidéos", href: "/watches" }} current={watch.title} />}
        share={
          <span className="flex items-center gap-4 lg:gap-8">
            <SaveButton kind="watch" variant="field" id={watch.watchId} saved={engagement.saved} />
            <ShareRead kind="watch" id={watch.watchId} url={url} title={watch.title} />
          </span>
        }
      />
      <article className="flex flex-col lg:px-8 lg:pt-[2.5rem] lg:pb-8">
        <FadeUp className="flex flex-col gap-[1.5rem]">
          <VideoPlayer videoUrl={watch.videoUrl} imageUrl={watch.imageUrl} title={watch.title} />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
              <h1 className="text-[1.8rem] leading-[1.45] font-bold tracking-[-0.054rem] text-ink lg:type-section lg:font-bold">{watch.title}</h1>
              <span className="flex shrink-0 flex-wrap gap-[0.5rem]">
                <VideoBadges watch={{ ...watch, viewCount: engagement.views }} />
              </span>
            </div>
            <AuthorChip author={watch.user} variant="page" />
            {watch.description && <p className="type-body text-faint lg:max-w-[70rem]">{watch.description}</p>}
          </div>
        </FadeUp>

        <RevealOnScroll className="mt-[2.5rem] border-t border-divider pt-[3.5rem] lg:mt-[3.5rem] lg:border-0 lg:pt-0">
          <ArticleEngagement kind="watch" id={watch.watchId} title={watch.title} engagement={engagement} />
        </RevealOnScroll>

        {recommended.length > 0 && (
          <section className="mt-[2.5rem] flex flex-col gap-8 lg:mt-[5rem]">
            <RevealOnScroll>
              <SectionHeader title="Vidéos recommandées" />
            </RevealOnScroll>
            <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {recommended.map((card, i) => (
                <RevealOnScroll as="li" key={card.watchId} index={i}>
                  <VideoCard watch={card} />
                </RevealOnScroll>
              ))}
            </ul>
          </section>
        )}
      </article>
    </AppLayout>
  );
}
