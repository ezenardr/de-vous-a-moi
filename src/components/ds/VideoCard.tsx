import Image from "next/image";
import Link from "next/link";
import { CalendarMonthFillIcon, ChartBarFillIcon, PlayCircleFillIcon, TimeFillIcon } from "@/components/icons/mingcute";
import { formatBadgeDate } from "@/lib/formatDate";
import { slugify } from "@/lib/Slugify";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/youtube";
import type { WatchSummary } from "@/server/queries/watches";
import { Badge } from "./Badge";
import { CoverBar } from "./CoverMeta";
import { SaveButton } from "./SaveButton";

// Date / duration / views, as on every video in Figma "Watches". No duration badge until YouTube gave one.
export function VideoBadges({ watch }: { watch: Pick<WatchSummary, "createdAt" | "durationSeconds" | "viewCount"> }) {
  return (
    <>
      <Badge icon={CalendarMonthFillIcon}>{formatBadgeDate(watch.createdAt)}</Badge>
      {watch.durationSeconds ? <Badge icon={TimeFillIcon}>{formatDuration(watch.durationSeconds)}</Badge> : null}
      <Badge icon={ChartBarFillIcon}>{watch.viewCount.toLocaleString("fr-FR")}</Badge>
    </>
  );
}

// Figma "Play video": frosted 50px pill, 5px padding, 20px play icon, Bold 14 white.
export function PlayPill({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "glass flex items-center gap-[0.5rem] rounded-pill p-[0.5rem] type-body font-bold text-white transition-transform duration-300 ease-out",
        className,
      )}
    >
      <PlayCircleFillIcon className="shrink-0" />
      Lire la vidéo
    </span>
  );
}

// Video cards from Figma "Watches" (desktop 153:14223, mobile 156:41983). Same boxes as ReadCard,
// but titles only (no description) and video badges:
// - hero: 400px (350 mobile), black 20% overlay, centred "Play video" pill, one-pill bar on desktop.
// - tall: gradient overlay, stacked bar. - grid: 250px, Medium 16 title.
export function VideoCard({ watch, variant = "grid", priority }: { watch: WatchSummary; variant?: "hero" | "tall" | "grid"; priority?: boolean }) {
  const featured = variant !== "grid";
  return (
    <Link
      href={`/watches/${slugify(watch.title, watch.watchId)}`}
      className={cn("group flex min-w-0 flex-col", variant === "hero" ? "gap-[0.8rem]" : "gap-4")}
    >
      <div className={cn("relative overflow-hidden rounded-card", featured ? "h-[35rem] lg:h-[40rem]" : "h-[25rem]")}>
        <Image
          src={watch.imageUrl}
          alt=""
          fill
          priority={priority}
          // The hero cover is the page's main image (LCP): fetch it first.
          fetchPriority={priority && variant === "hero" ? "high" : undefined}
          sizes={variant === "hero" ? "(min-width: 1024px) 735px, 100vw" : "(min-width: 1024px) 375px, 100vw"}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <div
          aria-hidden
          className={cn("absolute inset-0", variant === "hero" ? "bg-black/20" : "bg-linear-to-b from-black/13 from-[20.916%] to-black/20")}
        />
        {variant === "hero" && (
          <PlayPill className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-105" />
        )}
        <SaveButton kind="watch" id={watch.watchId} saved={watch.isSaved} className="absolute top-4 right-4 z-10" />
        <CoverBar author={watch.user} layout={variant === "hero" ? "row" : "stack"}>
          <VideoBadges watch={watch} />
        </CoverBar>
      </div>
      {featured ? (
        <h3 className="text-[1.8rem] leading-[1.45] font-bold tracking-[-0.054rem] text-ink lg:type-title lg:font-bold">{watch.title}</h3>
      ) : (
        <h3 className="type-body-lg font-medium text-ink">{watch.title}</h3>
      )}
    </Link>
  );
}
