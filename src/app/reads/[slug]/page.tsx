export const dynamic = "force-dynamic";

import Image from "next/image";
import type { Metadata } from "next";
import AppLayout from "@/components/layouts/AppLayout";
import { ArticleEngagement } from "@/components/article/ArticleEngagement";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import { InlineProgress, ReadingProgressProvider } from "@/components/article/ReadingProgress";
import { RelatedReads } from "@/components/article/RelatedReads";
import { ShareRead } from "@/components/article/ShareRead";
import { TableOfContents } from "@/components/article/TableOfContents";
import { ViewTracker } from "@/components/article/ViewTracker";
import { Breadcrumb } from "@/components/ds/Breadcrumb";
import { CoverMeta } from "@/components/ds/CoverMeta";
import { ReadCard } from "@/components/ds/ReadCard";
import { SaveButton } from "@/components/ds/SaveButton";
import { SectionHeader } from "@/components/ds/SectionHeader";
import { FadeUp, RevealOnScroll } from "@/components/motion/Reveal";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { getArticleEngagement, getSavedReadIds, markSaved } from "@/server/queries/reads";
import { loadArticle } from "./load";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { article, canonical } = await loadArticle((await params).slug);
  return {
    title: article.read.title,
    description: article.read.description,
    alternates: { canonical: `/reads/${canonical}` },
    openGraph: { type: "article", title: article.read.title, description: article.read.description },
  };
}

// Figma "Read open": desktop 153:12729 (logged out) / 153:13338 (logged in), mobile 155:34928.
// Desktop, 25px under the header, a 1130px column: 400px cover, 15px, title row; 35px; TOC (400) | 30 |
// body (700); 35px; divider; 35px; stats | comments; 50px; "Recommended stories".
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { article, canonical } = await loadArticle((await params).slug);
  const session = await auth();
  const viewerId = session?.user?.userId;
  const [engagement, saved] = await Promise.all([getArticleEngagement(article.read.readId, viewerId), getSavedReadIds(viewerId)]);
  const { read, related } = article;
  const recommended = markSaved(article.recommended, saved);
  const hasToc = read.toc.length > 0;
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/reads/${canonical}`;

  return (
    <AppLayout className="gap-[1.5rem] pt-[1.5rem] lg:gap-0 lg:p-0">
      <ReadingProgressProvider>
        <ViewTracker id={read.readId} />
        <ArticleHeader
          breadcrumb={<Breadcrumb parent={{ label: "Lectures", href: "/" }} current={read.title} />}
          share={<ShareRead id={read.readId} url={url} title={read.title} />}
        />
        <article className="flex flex-col lg:px-8 lg:pt-[2.5rem] lg:pb-8">
          <FadeUp className="flex flex-col gap-[1.5rem]">
            <div className="relative h-[35rem] overflow-hidden rounded-card lg:h-[40rem]">
              <Image src={read.imageUrl} alt="" fill priority sizes="(min-width: 1024px) 1130px, 100vw" className="object-cover" />
              <div aria-hidden className="absolute inset-0 bg-black/20" />
              <SaveButton id={read.readId} saved={engagement.saved} className="absolute top-4 right-4 z-10" />
              <CoverMeta read={read} layout="row" />
            </div>
            <div id="article-title" className="flex items-center justify-between gap-8">
              <h1 className="type-title font-bold text-ink lg:type-section lg:font-bold">{read.title}</h1>
              <span className="hidden lg:flex">
                <InlineProgress />
              </span>
            </div>
          </FadeUp>

          <div className={cn("mt-[3.5rem] flex flex-col gap-[2.5rem]", hasToc && "lg:flex-row lg:items-start lg:gap-[3rem]")}>
            {hasToc && (
              <FadeUp index={1} className="w-full shrink-0 lg:sticky lg:top-[10.5rem] lg:w-[40rem]">
                <TableOfContents toc={read.toc} />
              </FadeUp>
            )}
            {/* Without a TOC the body keeps the 700px measure of the TOC layout, centred. */}
            <FadeUp index={2} className={cn("flex min-w-0 flex-1 flex-col gap-[1.5rem]", !hasToc && "w-full lg:max-w-[70rem] lg:self-center")}>
              <div id="article-body" className="article-content" dangerouslySetInnerHTML={{ __html: read.html }} />
              <RelatedReads related={related} />
            </FadeUp>
          </div>

          <RevealOnScroll className="mt-[3.5rem] flex flex-col gap-[3.5rem] border-t border-divider pt-[3.5rem]">
            <ArticleEngagement id={read.readId} title={read.title} engagement={engagement} />
          </RevealOnScroll>

          {recommended.length > 0 && (
            <section className="mt-[5rem] flex flex-col gap-8">
              <RevealOnScroll>
                <SectionHeader title="Histoires recommandées" />
              </RevealOnScroll>
              <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {recommended.map((card, i) => (
                  <RevealOnScroll as="li" key={card.readId} index={i}>
                    <ReadCard read={card} />
                  </RevealOnScroll>
                ))}
              </ul>
            </section>
          )}
        </article>
      </ReadingProgressProvider>
    </AppLayout>
  );
}
