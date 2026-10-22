import Link from "next/link";
import { BoardFillIcon } from "@/components/icons/mingcute";
import { cn } from "@/lib/utils";
import { Badge } from "./Badge";
import { categoryStyle } from "./CategoryBadge";

export const categoryHref = (category: string) => `/categories/${encodeURIComponent(category)}`;

// Figma category tile (153:14948): 250px, category colour, 5px white/15% border, 5px radius.
// Figma offsets are from the outer edge (border included): title 17.5px in, badge 27.5px off the
// bottom, and the 150px icon (50% white) overhanging the bottom-right corner by 2.5px.
// Hover lifts the icon a little.
export function CategoryTile({ category, total }: { category: string; total: number }) {
  const { bg, tileIcon: Icon } = categoryStyle(category);
  return (
    <Link
      href={categoryHref(category)}
      className={cn(
        "group relative block h-[25rem] overflow-hidden rounded-card border-[0.5rem] border-white/15 transition-[filter] duration-300 hover:brightness-105",
        bg,
      )}
    >
      <h2 className="absolute top-[1.25rem] left-[1.25rem] text-[3.6rem] leading-[1.2] font-bold tracking-[-0.108rem] text-white">{category}</h2>
      <Icon
        size={150}
        aria-hidden
        className="absolute -right-[0.75rem] -bottom-[0.75rem] text-white opacity-50 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2 group-hover:-rotate-6"
      />
      <Badge icon={BoardFillIcon} className="absolute bottom-[2.25rem] left-[1.25rem]">
        {total} {total > 1 ? "lectures" : "lecture"}
      </Badge>
    </Link>
  );
}
