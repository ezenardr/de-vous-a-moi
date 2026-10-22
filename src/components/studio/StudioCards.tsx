import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ds/Badge";
import {
  BoardFillIcon,
  CalendarMonthFillIcon,
  ChartBarFillIcon,
  Comment2FillIcon,
  HeartFillIcon,
  TimeFillIcon,
} from "@/components/icons/mingcute";
import { formatBadgeDate, formatDateTime } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import type { StudioDraftItem, StudioItem } from "@/server/queries/studio";

const fr = (n: number) => n.toLocaleString("fr-FR");

// Lime "Programmé · 24 oct. 2026 à 09:00" marker for scheduled items.
export function ScheduledBadge({ date, className }: { date: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-[0.5rem] rounded-chip bg-secondary-base py-[0.5rem] pr-4 pl-[0.5rem] type-badge text-primary-base", className)}>
      <TimeFillIcon size={15} />
      Programmé · {formatDateTime(date)}
    </span>
  );
}

// Studio card: the site's grid card (250px cover, frosted bar, Medium 16 title) with the author's
// numbers in the bar: date, views, likes, comments. Scheduled items wear the lime marker.
export function StudioCard({ item, href }: { item: StudioItem; href: string }) {
  const scheduled = item.status === "scheduled";
  return (
    <Link href={href} className="group flex min-w-0 flex-col gap-4">
      <div className="relative h-[25rem] overflow-hidden rounded-card bg-field">
        <Image
          src={item.imageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 375px, 100vw"
          className={cn("object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]", scheduled && "opacity-80 grayscale-[35%]")}
        />
        <div aria-hidden className="absolute inset-0 bg-linear-to-b from-black/13 from-[20.916%] to-black/20" />
        {scheduled && <ScheduledBadge date={item.publishedAt} className="absolute top-4 left-4" />}
        <div className="glass absolute inset-x-4 bottom-4 flex flex-wrap gap-[0.5rem] rounded-glass p-[0.5rem]">
          {!scheduled && <Badge icon={CalendarMonthFillIcon}>{formatBadgeDate(item.publishedAt)}</Badge>}
          <Badge icon={ChartBarFillIcon}>{fr(item.stats.views)}</Badge>
          <Badge icon={HeartFillIcon}>{fr(item.stats.likes)}</Badge>
          <Badge icon={Comment2FillIcon}>{fr(item.stats.comments)}</Badge>
        </div>
      </div>
      <h3 className="type-body-lg font-medium text-ink">{item.title}</h3>
    </Link>
  );
}

// Draft card: the cover if there is one (otherwise a #f8f8f8 placeholder), a "Brouillon" badge with
// the last edit date, and the title ("Sans titre" until there is one).
export function DraftCard({ draft }: { draft: StudioDraftItem }) {
  return (
    <Link href={`/author/reads/draft/${draft.id}`} className="group flex min-w-0 flex-col gap-4">
      <div className="relative flex h-[25rem] items-center justify-center overflow-hidden rounded-card border border-dashed border-divider bg-field">
        {draft.imageUrl ? (
          <Image
            src={draft.imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 375px, 100vw"
            className="object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <BoardFillIcon size={48} className="text-placeholder" />
        )}
        <span className="absolute bottom-4 left-4 flex gap-[0.5rem]">
          <Badge>Brouillon</Badge>
          <Badge icon={CalendarMonthFillIcon}>Modifié le {formatBadgeDate(draft.updatedAt)}</Badge>
        </span>
      </div>
      <h3 className={cn("type-body-lg font-medium", draft.title ? "text-ink" : "text-faint italic")}>{draft.title || "Sans titre"}</h3>
    </Link>
  );
}
