export const dynamic = "force-dynamic";

import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import z from "zod";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import { TableOfContents } from "@/components/article/TableOfContents";
import { Breadcrumb } from "@/components/ds/Breadcrumb";
import { ButtonLink } from "@/components/ds/Button";
import { CoverMeta } from "@/components/ds/CoverMeta";
import { EyeFillIcon, QuillPenLineIcon } from "@/components/icons/mingcute";
import AppLayout from "@/components/layouts/AppLayout";
import { FadeUp } from "@/components/motion/Reveal";
import { calculateReadingTime } from "@/lib/calculateReadingTime";
import { cn } from "@/lib/utils";
import { authorOrRedirect } from "@/server/auth/guards";
import { prepareArticle } from "@/server/content/article";
import { getOwnDraft } from "@/server/queries/studio";
import { PublishButton } from "./PublishButton";

export const metadata = { title: "Aperçu | Mes articles", robots: { index: false } };

// The draft exactly as readers will see it: same pipeline (sanitised HTML, table of contents) and the
// same layout as the article page, under a sticky bar with "Modifier" and "Publier". An incomplete
// draft goes back to the editor.
export default async function PreviewPage({ params }: { params: Promise<{ readDraftId: string }> }) {
  const { readDraftId } = await params;
  const user = await authorOrRedirect();
  if (!z.uuid().safeParse(readDraftId).success) notFound();
  const draft = await getOwnDraft(readDraftId, user.userId);
  if (!draft) notFound();
  if (!draft.title || !draft.description || !draft.category || !draft.content || !draft.imageUrl) {
    redirect(`/author/reads/draft/${readDraftId}`);
  }
  const { html, toc } = prepareArticle(draft.content);
  const hasToc = toc.length > 0;
  const read = {
    user: { firstName: user.firstName, lastName: user.lastName, profileImageUrl: user.profileImageUrl },
    createdAt: new Date().toISOString(),
    readingTime: calculateReadingTime(draft.content),
    category: draft.category,
  };

  return (
    <AppLayout className="gap-[1.5rem] pt-[1.5rem] lg:gap-0 lg:p-0">
      <ArticleHeader
        backHref={`/author/reads/draft/${readDraftId}`}
        breadcrumb={<Breadcrumb parent={{ label: "Mes articles", href: "/author/reads?tab=drafts" }} current="Aperçu" />}
        share={
          <span className="flex items-center gap-4">
            <ButtonLink href={`/author/reads/draft/${readDraftId}`} variant="secondary" icon={QuillPenLineIcon}>
              Modifier
            </ButtonLink>
            <PublishButton readDraftId={readDraftId} />
          </span>
        }
      />
      <article className="flex flex-col lg:px-8 lg:pt-[2.5rem] lg:pb-8">
        <p className="mb-[1.5rem] flex items-center gap-4 rounded-card bg-secondary-100 px-[1.4rem] py-4 type-body text-primary-base">
          <EyeFillIcon className="shrink-0" />
          Aperçu : cette page n&apos;est visible que par vous. La date sera celle de la publication.
        </p>
        <FadeUp className="flex flex-col gap-[1.5rem]">
          <div className="relative h-[35rem] overflow-hidden rounded-card lg:h-[40rem]">
            <Image src={draft.imageUrl} alt="" fill priority sizes="(min-width: 1024px) 1130px, 100vw" className="object-cover" />
            <div aria-hidden className="absolute inset-0 bg-black/20" />
            <CoverMeta read={read} layout="row" />
          </div>
          <h1 className="type-title font-bold text-ink lg:type-section lg:font-bold">{draft.title}</h1>
        </FadeUp>
        <div className={cn("mt-[3.5rem] flex flex-col gap-[2.5rem]", hasToc && "lg:flex-row lg:items-start lg:gap-[3rem]")}>
          {hasToc && (
            <FadeUp index={1} className="w-full shrink-0 lg:sticky lg:top-[10.5rem] lg:w-[40rem]">
              <TableOfContents toc={toc} />
            </FadeUp>
          )}
          <FadeUp index={2} className={cn("flex min-w-0 flex-1 flex-col gap-[1.5rem]", !hasToc && "w-full lg:max-w-[70rem] lg:self-center")}>
            <div id="article-body" className="article-content" dangerouslySetInnerHTML={{ __html: html }} />
          </FadeUp>
        </div>
      </article>
    </AppLayout>
  );
}
