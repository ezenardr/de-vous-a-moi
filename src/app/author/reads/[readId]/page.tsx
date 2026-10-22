export const dynamic = "force-dynamic";

import { ArticleHeader } from "@/components/article/ArticleHeader";
import { Breadcrumb } from "@/components/ds/Breadcrumb";
import { ButtonLink } from "@/components/ds/Button";
import { ExternalLinkFillIcon, QuillPenLineIcon } from "@/components/icons/mingcute";
import AppLayout from "@/components/layouts/AppLayout";
import { StudioItemView } from "@/components/studio/StudioItemView";
import { slugify } from "@/lib/Slugify";
import { loadStudioRead } from "./load";

export async function generateMetadata({ params }: { params: Promise<{ readId: string }> }) {
  const { item } = await loadStudioRead((await params).readId);
  return { title: `${item.title} | Mes articles` };
}

// Studio page of a read: the article header ("Mes articles › title", back on mobile) with
// "Voir l'article" (once public) and "Modifier", then StudioItemView.
export default async function StudioReadPage({ params }: { params: Promise<{ readId: string }> }) {
  const { item } = await loadStudioRead((await params).readId);
  return (
    <AppLayout className="gap-[1.5rem] pt-[1.5rem] lg:gap-0 lg:p-0">
      <ArticleHeader
        backHref="/author/reads"
        breadcrumb={<Breadcrumb parent={{ label: "Mes articles", href: "/author/reads" }} current={item.title} />}
        share={
          <span className="flex items-center gap-4">
            {item.status === "published" && (
              <ButtonLink href={`/reads/${slugify(item.title, item.id)}`} variant="secondary" icon={ExternalLinkFillIcon}>
                Voir l&apos;article
              </ButtonLink>
            )}
            <ButtonLink href={`/author/reads/${item.id}/edit`} icon={QuillPenLineIcon}>
              Modifier
            </ButtonLink>
          </span>
        }
      />
      <StudioItemView kind="read" item={item} />
    </AppLayout>
  );
}
