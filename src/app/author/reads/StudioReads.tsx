"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SegmentedTabs } from "@/components/ds/SegmentedTabs";
import { BoardFillIcon, TimeFillIcon } from "@/components/icons/mingcute";
import { EASE_OUT } from "@/components/motion/easing";
import { DraftCard, StudioCard } from "@/components/studio/StudioCards";
import type { StudioDraftItem, StudioItem } from "@/server/queries/studio";

export type StudioReadsTab = "published" | "scheduled" | "drafts";

const EMPTY: Record<StudioReadsTab, string> = {
  published: "Vous n'avez encore rien publié. Écrivez votre premier article : il apparaîtra ici avec ses statistiques.",
  scheduled: "Aucun article programmé. Depuis l'aperçu d'un brouillon, choisissez « Programmer » pour le publier plus tard.",
  drafts: "Aucun brouillon en cours. « Nouvel article » en crée un.",
};

// Published / scheduled / drafts, each a grid of cards (three per row, 20px gaps; one column on mobile).
export function StudioReads({ items, drafts, initialTab }: { items: StudioItem[]; drafts: StudioDraftItem[]; initialTab: StudioReadsTab }) {
  const [tab, setTab] = useState<StudioReadsTab>(initialTab);
  const published = items.filter((i) => i.status === "published");
  const scheduled = items.filter((i) => i.status === "scheduled");
  const count = { published: published.length, scheduled: scheduled.length, drafts: drafts.length };

  function switchTab(next: StudioReadsTab) {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "published") url.searchParams.delete("tab");
    else url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url);
  }

  const cards =
    tab === "drafts"
      ? drafts.map((draft) => ({ key: draft.id, node: <DraftCard draft={draft} /> }))
      : (tab === "published" ? published : scheduled).map((item) => ({
          key: item.id,
          node: <StudioCard item={item} href={`/author/reads/${item.id}`} />,
        }));

  return (
    <section className="flex flex-col gap-8">
      <SegmentedTabs
        label="Mes articles"
        value={tab}
        onChange={switchTab}
        tabs={[
          { value: "published", label: `Publiés (${count.published})` },
          { value: "scheduled", label: `Programmés (${count.scheduled})` },
          { value: "drafts", label: `Brouillons (${count.drafts})` },
        ]}
      />
      {cards.length === 0 ? (
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className="mx-auto flex max-w-[36rem] flex-col items-center gap-[1.5rem] py-16 text-center"
        >
          {tab === "scheduled" ? <TimeFillIcon size={64} className="text-faint" /> : <BoardFillIcon size={64} className="text-faint" />}
          <p className="type-body font-medium text-faint">{EMPTY[tab]}</p>
        </motion.div>
      ) : (
        <motion.ul key={tab} layout className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {cards.map((card, i) => (
              <motion.li
                key={card.key}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT, delay: Math.min(i, 8) * 0.05 } }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
              >
                {card.node}
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </section>
  );
}
