"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SegmentedTabs } from "@/components/ds/SegmentedTabs";
import { TimeFillIcon, VideoFillIcon } from "@/components/icons/mingcute";
import { EASE_OUT } from "@/components/motion/easing";
import { StudioCard } from "@/components/studio/StudioCards";
import type { StudioItem } from "@/server/queries/studio";

export type StudioWatchesTab = "published" | "scheduled";

const EMPTY: Record<StudioWatchesTab, string> = {
  published: "Aucune vidéo publiée pour l'instant. « Nouvelle vidéo » vous guide.",
  scheduled: "Aucune vidéo programmée. À la création, choisissez « Programmer » pour la publier plus tard.",
};

// Published / scheduled videos, as cards (three per row, 20px gaps; one column on mobile).
export function StudioWatches({ items, initialTab }: { items: StudioItem[]; initialTab: StudioWatchesTab }) {
  const [tab, setTab] = useState<StudioWatchesTab>(initialTab);
  const shown = items.filter((i) => i.status === tab);
  const count = (status: StudioWatchesTab) => items.filter((i) => i.status === status).length;

  function switchTab(next: StudioWatchesTab) {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "published") url.searchParams.delete("tab");
    else url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url);
  }

  return (
    <section className="flex flex-col gap-8">
      <SegmentedTabs
        label="Mes vidéos"
        value={tab}
        onChange={switchTab}
        tabs={[
          { value: "published", label: `Publiées (${count("published")})` },
          { value: "scheduled", label: `Programmées (${count("scheduled")})` },
        ]}
      />
      {shown.length === 0 ? (
        <div key={tab} className="enter-up mx-auto flex max-w-[36rem] flex-col items-center gap-[1.5rem] py-16 text-center">
          {tab === "scheduled" ? <TimeFillIcon size={64} className="text-faint" /> : <VideoFillIcon size={64} className="text-faint" />}
          <p className="type-body font-medium text-faint">{EMPTY[tab]}</p>
        </div>
      ) : (
        <motion.ul key={tab} layout className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {shown.map((item, i) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT, delay: Math.min(i, 8) * 0.05 } }}
              >
                <StudioCard item={item} href={`/author/watches/${item.id}`} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </section>
  );
}
