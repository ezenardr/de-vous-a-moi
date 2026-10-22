export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import z from "zod";
import { VideoPlayer } from "@/app/watches/[slug]/VideoPlayer";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import { Breadcrumb } from "@/components/ds/Breadcrumb";
import { ButtonLink } from "@/components/ds/Button";
import { ExternalLinkFillIcon, QuillPenLineIcon } from "@/components/icons/mingcute";
import AppLayout from "@/components/layouts/AppLayout";
import { StudioItemView } from "@/components/studio/StudioItemView";
import { slugify } from "@/lib/Slugify";
import { authorOrRedirect } from "@/server/auth/guards";
import { getStudioWatch } from "@/server/queries/studio";

export const metadata = { title: "Ma vidéo" };

// Studio page of a video: "Mes vidéos › title" with "Voir la vidéo" (once public) and "Modifier", the player, status
// (and the scheduling actions), numbers and description. Someone else's video is a 404.
export default async function StudioWatchPage({ params }: { params: Promise<{ watchId: string }> }) {
  const { watchId } = await params;
  const user = await authorOrRedirect();
  if (!z.uuid().safeParse(watchId).success) notFound();
  const item = await getStudioWatch(watchId, user.userId);
  if (!item) notFound();

  return (
    <AppLayout className="gap-[1.5rem] pt-[1.5rem] lg:gap-0 lg:p-0">
      <ArticleHeader
        backHref="/author/watches"
        breadcrumb={<Breadcrumb parent={{ label: "Mes vidéos", href: "/author/watches" }} current={item.title} />}
        share={
          <span className="flex items-center gap-4">
            {item.status === "published" && (
              <ButtonLink href={`/watches/${slugify(item.title, item.id)}`} variant="secondary" icon={ExternalLinkFillIcon}>
                Voir la vidéo
              </ButtonLink>
            )}
            <ButtonLink href={`/author/watches/${item.id}/edit`} icon={QuillPenLineIcon}>
              Modifier
            </ButtonLink>
          </span>
        }
      />
      <StudioItemView
        kind="watch"
        item={item}
        media={item.videoUrl ? <VideoPlayer videoUrl={item.videoUrl} imageUrl={item.imageUrl} title={item.title} /> : undefined}
      />
    </AppLayout>
  );
}
