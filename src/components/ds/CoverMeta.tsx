import type { ReactNode } from "react";
import { CalendarMonthFillIcon, TimeFillIcon } from "@/components/icons/mingcute";
import { formatBadgeDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import type { ReadSummary } from "@/server/queries/reads";
import { AuthorChip } from "./AuthorChip";
import { Badge } from "./Badge";
import { CategoryBadge } from "./CategoryBadge";

type Layout = "row" | "stack";

// The frosted bar over cover images: author, then a row of badges.
// "row": one 50px-radius pill on desktop (featured hero, article hero); always stacked on mobile.
export function CoverBar({ author, layout = "stack", children }: { author: ReadSummary["user"]; layout?: Layout; children: ReactNode }) {
  return (
    <div
      className={cn(
        "glass absolute inset-x-4 bottom-4 flex flex-col gap-4 rounded-glass p-[0.5rem]",
        layout === "row" && "lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:rounded-pill",
      )}
    >
      <AuthorChip author={author} />
      <span className="flex min-w-0 flex-wrap gap-[0.5rem]">{children}</span>
    </div>
  );
}

// Reads: date / reading time / category.
export function CoverMeta({
  read,
  layout = "stack",
  showCategory = true,
}: {
  read: Pick<ReadSummary, "user" | "createdAt" | "readingTime" | "category">;
  layout?: Layout;
  showCategory?: boolean;
}) {
  return (
    <CoverBar author={read.user} layout={layout}>
      <Badge icon={CalendarMonthFillIcon}>{formatBadgeDate(read.createdAt)}</Badge>
      <Badge icon={TimeFillIcon}>{read.readingTime} min</Badge>
      {showCategory && <CategoryBadge category={read.category} />}
    </CoverBar>
  );
}
