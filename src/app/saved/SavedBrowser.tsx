"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ComponentType } from "react";
import { ButtonLink } from "@/components/ds/Button";
import { FilterField, fold } from "@/components/ds/FilterField";
import { PageHeader } from "@/components/ds/PageHeader";
import { ReadCard } from "@/components/ds/ReadCard";
import { SegmentedTabs } from "@/components/ds/SegmentedTabs";
import { VideoCard } from "@/components/ds/VideoCard";
import { BoardFillIcon, BookmarksFillIcon, UserAdd2FillIcon, VideoFillIcon } from "@/components/icons/mingcute";
import { EASE_OUT } from "@/components/motion/easing";
import { loginHref } from "@/lib/callbackUrl";
import type { ReadSummary } from "@/server/queries/reads";
import type { WatchSummary } from "@/server/queries/watches";

export type SavedTab = "reads" | "videos";
type Icon = ComponentType<{ size?: number; className?: string }>;

// Figma "Saves" empty / signed-out block (153:15450, 153:15467): centred 100px bookmarks icon, 15px,
// a 300px Medium 14 #a3a3a3 message, 15px, a lime button.
export function SavedEmpty({ message, action }: { message: string; action: { href: string; label: string; icon: Icon } }) {
  return (
    <div className="enter-up m-auto flex flex-col items-center gap-[1.5rem] py-16 text-center">
      <BookmarksFillIcon size={100} className="text-faint" />
      <p className="w-[30rem] max-w-full type-body font-medium text-faint">{message}</p>
      <ButtonLink href={action.href} icon={action.icon}>
        {action.label}
      </ButtonLink>
    </div>
  );
}

// Signed out (153:15437): the same header, the field inert, and the sign-in prompt.
export function SavedSignedOut() {
  return (
    <>
      <PageHeader title={<h1>Favoris</h1>} search={false}>
        <FilterField value="" onChange={() => {}} label="Rechercher dans mes favoris" disabled />
      </PageHeader>
      <SavedEmpty
        message="Il vous faut un compte pour garder les histoires que vous aimez et y revenir quand vous voulez."
        action={{ href: loginHref("/saved"), label: "Se connecter pour enregistrer", icon: UserAdd2FillIcon }}
      />
    </>
  );
}

const EMPTY: Record<SavedTab, { message: string; action: { href: string; label: string; icon: Icon } }> = {
  reads: {
    message: "Quand une histoire vous parle, touchez l'icône d'enregistrement : elle vous attendra ici pour la relire.",
    action: { href: "/", label: "Explorer les lectures", icon: BoardFillIcon },
  },
  videos: {
    message: "Quand une vidéo vous parle, enregistrez-la : elle vous attendra ici pour la revoir.",
    action: { href: "/watches", label: "Explorer les vidéos", icon: VideoFillIcon },
  },
};

// Figma "Saves" (153:15471 reads, 153:15583 watches; mobile 156:50768): the header field filters the
// saved items as you type; Reads / Watches tabs; cards in rows of three with 20px gaps.
// Unsaving a card removes it from the list (the page data refreshes; the card animates out).
export function SavedBrowser({ reads, watches, initialTab }: { reads: ReadSummary[]; watches: WatchSummary[]; initialTab: SavedTab }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<SavedTab>(initialTab);
  const needle = fold(query.trim());
  const shownReads = reads.filter((r) => fold(r.title).includes(needle));
  const shownWatches = watches.filter((w) => fold(w.title).includes(needle));
  const nothingSaved = reads.length === 0 && watches.length === 0;
  const items = tab === "reads" ? shownReads : shownWatches;
  const total = tab === "reads" ? reads.length : watches.length;

  function switchTab(next: SavedTab) {
    setTab(next);
    // Keep the tab in the URL (back button, sharing the link) without a server round trip.
    const url = new URL(window.location.href);
    if (next === "videos") url.searchParams.set("tab", "videos");
    else url.searchParams.delete("tab");
    window.history.replaceState(null, "", url);
  }

  return (
    <>
      <PageHeader title={<h1>Favoris</h1>} search={false}>
        <FilterField value={query} onChange={setQuery} label="Rechercher dans mes favoris" />
      </PageHeader>
      {nothingSaved ? (
        <SavedEmpty {...EMPTY.reads} />
      ) : (
        <div className="flex flex-1 flex-col gap-8 lg:px-8 lg:pt-[2.5rem] lg:pb-8">
          <SegmentedTabs
            label="Type de favoris"
            value={tab}
            onChange={switchTab}
            tabs={[
              { value: "reads", label: "Lectures" },
              { value: "videos", label: "Vidéos" },
            ]}
          />
          {total === 0 ? (
            <SavedEmpty key={tab} {...EMPTY[tab]} />
          ) : items.length === 0 ? (
            <p className="py-16 text-center type-body font-medium text-faint">Aucun favori ne correspond à « {query.trim()} ».</p>
          ) : (
            <motion.ul key={tab} layout className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence initial={false} mode="popLayout">
                {items.map((item, i) => (
                  <motion.li
                    key={"readId" in item ? item.readId : item.watchId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT, delay: query ? 0 : Math.min(i, 8) * 0.05 } }}
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                  >
                    {"readId" in item ? <ReadCard read={item} /> : <VideoCard watch={item} />}
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </div>
      )}
    </>
  );
}
