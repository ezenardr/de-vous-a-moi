export const dynamic = "force-dynamic";

import Image from "next/image";
import Messara from "@/assets/images/messara.jpg";
import { ShareRead } from "@/components/article/ShareRead";
import { CategoryTile } from "@/components/ds/CategoryTile";
import { PageHeader } from "@/components/ds/PageHeader";
import { ReadCard } from "@/components/ds/ReadCard";
import { SectionHeader } from "@/components/ds/SectionHeader";
import { StatTiles } from "@/components/ds/StatTiles";
import AppLayout from "@/components/layouts/AppLayout";
import { FadeUp, RevealOnScroll } from "@/components/motion/Reveal";
import { auth } from "@/lib/auth";
import { getAllReadsCached, getCategoriesCached, getSavedReadIds, markSaved } from "@/server/queries/reads";
import { getAllWatchesCached } from "@/server/queries/watches";
import { NewsletterCta } from "./NewsletterCta";

export const metadata = {
  title: "À propos | De vous à moi",
  description: "Là où l'encre et votre voix s'harmonisent : on le pense, on en parle. Le mot de Messara Ezenard, rédactrice en chef.",
};

const LETTER = [
  "Je me suis engagée à écrire le blog De Vous à Moi, parce que je crois fermement que les mots ont le pouvoir de transformer des idées en expériences partagées.",
  "Chaque jour, mon équipe et moi découvrons de nouvelles raisons d’ouvrir nos esprits et de coucher nos pensées sur le papier pour les partager avec vous. À travers nos articles, nous explorons une multitude de thématiques, offrant des perspectives uniques et créant un espace où réflexion et inspiration se rencontrent.",
  "De Vous à Moi est une aventure que nous construisons ensemble, avec vous, nos précieux lecteurs. Ce blog est bien plus qu’un simple projet d’écriture : c’est un moyen de tisser des liens, de susciter des émotions et d’apporter de la valeur à nos lecteurs, qu’ils recherchent des conseils pratiques, des récits captivants ou des moments d’évasion.",
  "Vos retours, vos échanges et vos inspirations donnent vie à chaque mot que nous écrivons, et nous sommes impatients de continuer cette belle démarche à vos côtés.",
];

// No Figma frame: built from the site's pieces. Desktop, 25px under the header, the home featured row
// grid (735 + 20 + 375): the tagline, intro and letter on the left; Messara's portrait (375 x 500,
// stays in view) on the right. Then, 50px apart: live numbers, "Ce dont on parle" (category tiles),
// "Derniers articles" (3 read cards) and the newsletter block. Mobile: one column, portrait first.
// All content is cached (reads/watches/categories); only the viewer's saved state is per request.
export default async function AboutPage() {
  const session = await auth();
  const [reads, watches, categories, saved] = await Promise.all([
    getAllReadsCached(),
    getAllWatchesCached(),
    getCategoriesCached(),
    getSavedReadIds(session?.user?.userId),
  ]);
  const latest = markSaved(reads.slice(0, 3), saved);
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/about`;

  return (
    <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
      <PageHeader title={<h1>À propos</h1>} search={false}>
        <ShareRead kind="site" url={url} title="De vous à moi" />
      </PageHeader>

      <div className="flex flex-col gap-[3rem] lg:gap-[5rem] lg:px-8 lg:pt-[2.5rem] lg:pb-8">
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,73.5fr)_minmax(0,37.5fr)] lg:items-start">
          <FadeUp index={1} className="order-2 flex flex-col gap-[2.5rem] lg:order-1">
            <div className="flex flex-col gap-[1.5rem]">
              <h2 className="text-[1.8rem] leading-[1.45] font-bold tracking-[-0.054rem] text-ink lg:type-section lg:font-bold">
                Là où l’encre et votre voix s’harmonisent : on le pense, on en parle.
              </h2>
              <p className="type-body-lg text-faint">
                Créer De Vous à Moi a été l’une des expériences les plus incroyables. Nous adorons découvrir les différentes façons dont vous
                explorez notre blog. Parcourez nos articles pour trouver de nouvelles perspectives sur la vie, le monde, la culture et
                laissez-vous inspirer.
              </p>
            </div>
            <div className="flex flex-col gap-[1.5rem] border-t border-divider pt-[2.5rem] type-body-lg text-ink">
              {LETTER.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
              <p className="mt-4 flex flex-col">
                <span className="font-bold">Messara Ezenard</span>
                <span className="text-faint">Rédactrice en chef</span>
              </p>
            </div>
          </FadeUp>

          <FadeUp className="order-1 lg:sticky lg:top-[10.5rem] lg:order-2">
            <figure className="relative h-[42rem] overflow-hidden rounded-card lg:h-[50rem]">
              <Image
                src={Messara}
                alt="Messara Ezenard, rédactrice en chef de De vous à moi"
                fill
                priority
                placeholder="blur"
                sizes="(min-width: 1024px) 375px, 100vw"
                className="object-cover object-[50%_20%]"
              />
              <div aria-hidden className="absolute inset-0 bg-linear-to-b from-black/0 from-[55%] to-black/30" />
              <figcaption className="glass absolute inset-x-4 bottom-4 flex flex-col rounded-glass px-4 py-[0.8rem] text-white">
                <span className="type-body font-bold">Messara Ezenard</span>
                <span className="type-body">Rédactrice en chef</span>
              </figcaption>
            </figure>
          </FadeUp>
        </section>

        <RevealOnScroll>
          <StatTiles
            stats={[
              { label: reads.length > 1 ? "articles publiés" : "article publié", value: reads.length },
              { label: watches.length > 1 ? "vidéos" : "vidéo", value: watches.length },
              { label: categories.length > 1 ? "catégories" : "catégorie", value: categories.length },
            ]}
          />
        </RevealOnScroll>

        {categories.length > 0 && (
          <section className="flex flex-col gap-8">
            <RevealOnScroll>
              <SectionHeader title="Ce dont on parle" href="/categories" />
            </RevealOnScroll>
            <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {categories.map(({ category, total }, i) => (
                <RevealOnScroll as="li" key={category} index={i % 4}>
                  <CategoryTile category={category} total={total} />
                </RevealOnScroll>
              ))}
            </ul>
          </section>
        )}

        {latest.length > 0 && (
          <section className="flex flex-col gap-8">
            <RevealOnScroll>
              <SectionHeader title="Derniers articles" href="/reads" />
            </RevealOnScroll>
            <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {latest.map((read, i) => (
                <RevealOnScroll as="li" key={read.readId} index={i}>
                  <ReadCard read={read} />
                </RevealOnScroll>
              ))}
            </ul>
          </section>
        )}

        <RevealOnScroll>
          <NewsletterCta />
        </RevealOnScroll>
      </div>
    </AppLayout>
  );
}
