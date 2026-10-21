import Image from "next/image";
import Link from "next/link";
import { CalendarMonthFillIcon, TimeFillIcon } from "@/components/icons/mingcute";
import { formatBadgeDate } from "@/lib/formatDate";
import { slugify } from "@/lib/Slugify";
import { cn } from "@/lib/utils";
import type { ReadSummary } from "@/server/queries/reads";
import { AuthorChip } from "./AuthorChip";
import { Badge } from "./Badge";
import { CategoryBadge } from "./CategoryBadge";
import { SaveButton } from "./SaveButton";

// Figma read cards.
// - hero: wide featured card (400px), author and badges on one frosted row, with description
// - tall: narrow featured card (400px), author above badges in a frosted block, with description
// - grid: list card (250px), frosted block, title only
type Variant = "hero" | "tall" | "grid";

export function ReadCard({ read, variant = "grid", priority }: { read: ReadSummary; variant?: Variant; priority?: boolean }) {
  const isFeatured = variant !== "grid";
  return (
    <Link href={`/reads/${slugify(read.title, read.readId)}`} className="group flex min-w-0 flex-col gap-[0.8rem]">
      <div className={cn("relative overflow-hidden rounded-card", isFeatured ? "h-[40rem]" : "h-[25rem]")}>
        <Image
          src={read.imageUrl}
          alt=""
          fill
          priority={priority}
          sizes={variant === "hero" ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 30vw, 100vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div
          className={cn(
            "absolute inset-0",
            variant === "hero" ? "bg-black/20" : "bg-gradient-to-b from-black/13 from-[21%] to-black/20",
          )}
        />
        <SaveButton readId={read.readId} saved={read.isSaved} className="absolute top-4 right-4 z-10" />
        <div
          className={cn(
            "glass absolute inset-x-4 bottom-4 flex gap-4 p-[0.5rem]",
            variant === "hero"
              ? "flex-col rounded-glass lg:flex-row lg:items-center lg:justify-between lg:rounded-pill"
              : "flex-col rounded-glass",
          )}
        >
          <AuthorChip author={read.user} />
          <span className="flex min-w-0 flex-wrap gap-[0.5rem]">
            <Badge icon={CalendarMonthFillIcon}>{formatBadgeDate(read.createdAt)}</Badge>
            <Badge icon={TimeFillIcon}>{read.readingTime} min</Badge>
            <CategoryBadge category={read.category} />
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-[0.5rem]">
        <h3 className={cn("text-ink", isFeatured ? "type-title font-bold" : "type-body-lg font-medium")}>{read.title}</h3>
        {isFeatured && <p className="type-body max-w-[60rem] text-faint">{read.description}</p>}
      </div>
    </Link>
  );
}
