export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import AppLayout from "@/components/layouts/AppLayout";
import { Breadcrumb } from "@/components/ds/Breadcrumb";
import { PageHeader } from "@/components/ds/PageHeader";
import { categoryHref } from "@/components/ds/CategoryTile";
import { LeftFillIcon } from "@/components/icons/mingcute";
import { ReadCard } from "@/components/ds/ReadCard";
import { FadeUp, RevealOnScroll } from "@/components/motion/Reveal";
import { auth } from "@/lib/auth";
import { getSavedReadIds, markSaved } from "@/server/queries/reads";
import { loadCategory } from "./load";
import { breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { category } = await loadCategory((await params).slug);
  return {
    title: category,
    description: `Les articles « ${category} » de De vous à moi, du plus récent au plus ancien.`,
    alternates: { canonical: categoryHref(category) },
  };
}

// Figma "Categories open" (153:15026), mobile 156:49023: breadcrumb header, then 25px down rows of
// three read cards (363 x 250, 20px gaps) without the category badge. Mobile: a 40px back button,
// 20px, then the category name and search; one column.
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { category, reads: all } = await loadCategory((await params).slug);
  const session = await auth();
  const reads = markSaved(all, await getSavedReadIds(session?.user?.userId));

  return (
    <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
      <Link href="/categories" aria-label="Retour aux catégories" className="flex self-start rounded-[1rem] bg-field p-4 text-ink lg:hidden">
        <LeftFillIcon />
      </Link>
      <JsonLd data={breadcrumbJsonLd([{ name: "Catégories", path: "/categories" }, { name: category, path: categoryHref(category) }])} />
      <PageHeader title={<Breadcrumb parent={{ label: "Catégories", href: "/categories" }} current={category} mobileBack={false} />} />
      <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:px-8 lg:pt-[2.5rem] lg:pb-8">
        {reads.map((read, i) =>
          i < 6 ? (
            <FadeUp as="li" key={read.readId} index={i}>
              <ReadCard read={read} priority={i < 3} showCategory={false} />
            </FadeUp>
          ) : (
            <RevealOnScroll as="li" key={read.readId} index={i % 3}>
              <ReadCard read={read} showCategory={false} />
            </RevealOnScroll>
          ),
        )}
      </ul>
    </AppLayout>
  );
}
