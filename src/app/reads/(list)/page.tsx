export const dynamic = "force-dynamic";

import AppLayout from "@/components/layouts/AppLayout";
import { Breadcrumb } from "@/components/ds/Breadcrumb";
import { EmptyState } from "@/components/ds/EmptyState";
import { PageHeader } from "@/components/ds/PageHeader";
import { ReadCard } from "@/components/ds/ReadCard";
import { SectionHeader } from "@/components/ds/SectionHeader";
import { FadeUp, RevealOnScroll } from "@/components/motion/Reveal";
import { auth } from "@/lib/auth";
import { getAllReadsCached, getSavedReadIds, markSaved } from "@/server/queries/reads";
import { breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = {
  title: "Toutes les lectures",
  description: "Tous les articles de De vous à moi, du plus récent au plus ancien : actualités, style de vie, portraits et technologies.",
  alternates: { canonical: "/reads" },
};

// Figma "Reads › All reads" (153:11005): breadcrumb header, then 25px down a 1130px column:
// "All reads" title, 20px, then rows of three 283px cards with 20px gaps.
// No mobile frame: follows the home page's mobile layout (single column, 20px gaps).
export default async function ReadAllPage() {
  const session = await auth();
  const [all, saved] = await Promise.all([getAllReadsCached(), getSavedReadIds(session?.user?.userId)]);
  const reads = markSaved(all, saved);

  return (
    <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
      <JsonLd data={breadcrumbJsonLd([{ name: "Lectures", path: "/" }, { name: "Toutes les lectures", path: "/reads" }])} />
      <PageHeader title={<Breadcrumb parent={{ label: "Lectures", href: "/" }} current="Toutes les lectures" />} />
      <section className="flex flex-col gap-8 lg:px-8 lg:pt-[2.5rem] lg:pb-8">
        <FadeUp>
          <SectionHeader title="Toutes les lectures" />
        </FadeUp>
        {reads.length === 0 ? (
          <EmptyState>Aucun article n&apos;est encore publié. Revenez bientôt !</EmptyState>
        ) : (
          <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {reads.map((read, i) =>
              i < 6 ? (
                <FadeUp as="li" key={read.readId} index={i}>
                  <ReadCard read={read} priority={i < 3} />
                </FadeUp>
              ) : (
                <RevealOnScroll as="li" key={read.readId} index={i % 3}>
                  <ReadCard read={read} />
                </RevealOnScroll>
              ),
            )}
          </ul>
        )}
      </section>
    </AppLayout>
  );
}
