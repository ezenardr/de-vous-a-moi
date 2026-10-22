import Image from "next/image";
import { CategoryBadge } from "@/components/ds/CategoryBadge";
import { StatTiles } from "@/components/ds/StatTiles";
import { FadeUp, RevealOnScroll } from "@/components/motion/Reveal";
import { formatBadgeDate } from "@/lib/formatDate";
import type { StudioItem } from "@/server/queries/studio";
import { ScheduledActions } from "./ScheduledActions";
import { ScheduledBadge } from "./StudioCards";

// The studio page of one read or video: cover (or the player), title, status, numbers, description.
export function StudioItemView({ kind, item, media }: { kind: "read" | "watch"; item: StudioItem; media?: React.ReactNode }) {
  const scheduled = item.status === "scheduled";
  return (
    <div className="flex flex-col gap-[3rem] lg:gap-[3.5rem] lg:px-8 lg:pt-[2.5rem] lg:pb-8">
      <FadeUp className="flex flex-col gap-[1.5rem]">
        {media ?? (
          <div className="relative h-[35rem] overflow-hidden rounded-card lg:h-[40rem]">
            <Image src={item.imageUrl} alt="" fill priority sizes="(min-width: 1024px) 1130px, 100vw" className="object-cover" />
            <div aria-hidden className="absolute inset-0 bg-black/20" />
          </div>
        )}
        <div className="flex flex-col gap-4">
          <h1 className="text-[1.8rem] leading-[1.45] font-bold tracking-[-0.054rem] text-ink lg:type-section lg:font-bold">{item.title}</h1>
          <div className="flex flex-wrap items-center gap-[0.5rem]">
            {scheduled ? (
              <ScheduledBadge date={item.publishedAt} />
            ) : (
              <span className="type-body text-faint">Publié le {formatBadgeDate(item.publishedAt)}</span>
            )}
            {kind === "read" && <CategoryBadge category={item.category} />}
          </div>
        </div>
        {scheduled && <ScheduledActions kind={kind} id={item.id} publishAt={item.publishedAt} />}
      </FadeUp>
      <RevealOnScroll className="flex flex-col gap-8">
        <h2 className="type-title font-bold text-ink">Statistiques</h2>
        {scheduled ? (
          <p className="type-body text-faint">
            Les statistiques apparaîtront une fois {kind === "read" ? "l'article publié" : "la vidéo publiée"}.
          </p>
        ) : (
          <StatTiles
            compact
            stats={[
              { label: "vues", value: item.stats.views },
              { label: "j'aime", value: item.stats.likes },
              { label: "commentaires", value: item.stats.comments },
              { label: "partages", value: item.stats.shares },
              { label: "enregistrements", value: item.stats.saves },
            ]}
          />
        )}
      </RevealOnScroll>
      <RevealOnScroll className="flex flex-col gap-4">
        <h2 className="type-title font-bold text-ink">Description</h2>
        <p className="type-body-lg text-faint lg:max-w-[70rem]">{item.description}</p>
      </RevealOnScroll>
    </div>
  );
}
