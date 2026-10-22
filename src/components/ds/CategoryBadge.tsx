import { Building6FillIcon, ComputerFillIcon, Folder3FillIcon, Mic2FillIcon, MicFillIcon, TeacupFillIcon } from "@/components/icons/mingcute";
import { Badge } from "./Badge";

type CategoryStyle = { icon: typeof TeacupFillIcon; color: string; bg: string; tileIcon: typeof TeacupFillIcon };

// The site's four categories, styled like the Figma category badges (icon and label share the colour).
// bg / tileIcon: the Figma "Categories" tiles (153:14934). Actualités = "Society", Style de vie =
// "Lifestyle", Le Spotlight = "Interviews"; Technologies has no tile in Figma and uses its badge blue.
export const CATEGORIES: Record<string, CategoryStyle> = {
  Actualités: { icon: Building6FillIcon, color: "text-cat-news", bg: "bg-cat-news", tileIcon: Building6FillIcon },
  "Style de vie": { icon: TeacupFillIcon, color: "text-cat-lifestyle", bg: "bg-cat-lifestyle", tileIcon: TeacupFillIcon },
  "Le Spotlight": { icon: MicFillIcon, color: "text-cat-spotlight", bg: "bg-cat-spotlight", tileIcon: Mic2FillIcon },
  Technologies: { icon: ComputerFillIcon, color: "text-cat-tech", bg: "bg-cat-tech", tileIcon: ComputerFillIcon },
};

export function categoryStyle(category: string): CategoryStyle {
  return CATEGORIES[category] ?? { icon: Folder3FillIcon, color: "text-ink", bg: "bg-primary-base", tileIcon: Folder3FillIcon };
}

export function CategoryBadge({ category, className }: { category: string; className?: string }) {
  const { icon, color } = categoryStyle(category);
  return (
    <Badge icon={icon} iconClassName={color} className={`${color} ${className ?? ""}`}>
      <span className="max-w-[16rem] truncate">{category}</span>
    </Badge>
  );
}
