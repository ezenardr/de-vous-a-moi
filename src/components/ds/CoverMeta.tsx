import { CalendarMonthFillIcon, TimeFillIcon } from "@/components/icons/mingcute";
import { formatBadgeDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import type { ReadSummary } from "@/server/queries/reads";
import { AuthorChip } from "./AuthorChip";
import { Badge } from "./Badge";
import { CategoryBadge } from "./CategoryBadge";

// The frosted bar over cover images: author, then date / reading time / category badges.
// "row": one 50px-radius pill on desktop (featured hero, article hero); always stacked on mobile.
export function CoverMeta({ read, layout = "stack" }: { read: Pick<ReadSummary, "user" | "createdAt" | "readingTime" | "category">; layout?: "row" | "stack" }) {
  return (
    <div
      className={cn(
        "glass absolute inset-x-4 bottom-4 flex flex-col gap-4 rounded-glass p-[0.5rem]",
        layout === "row" && "lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:rounded-pill",
      )}
    >
      <AuthorChip author={read.user} />
      <span className="flex min-w-0 flex-wrap gap-[0.5rem]">
        <Badge icon={CalendarMonthFillIcon}>{formatBadgeDate(read.createdAt)}</Badge>
        <Badge icon={TimeFillIcon}>{read.readingTime} min</Badge>
        <CategoryBadge category={read.category} />
      </span>
    </div>
  );
}
