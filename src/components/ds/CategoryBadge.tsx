import { Building6FillIcon, ComputerFillIcon, Folder3FillIcon, MicFillIcon, TeacupFillIcon } from "@/components/icons/mingcute";
import { Badge } from "./Badge";

// The site's four categories, styled like the Figma category badges (icon and label share the colour).
export const CATEGORIES: Record<string, { icon: typeof TeacupFillIcon; color: string }> = {
  Actualités: { icon: Building6FillIcon, color: "text-cat-news" },
  "Style de vie": { icon: TeacupFillIcon, color: "text-cat-lifestyle" },
  "Le Spotlight": { icon: MicFillIcon, color: "text-cat-spotlight" },
  Technologies: { icon: ComputerFillIcon, color: "text-cat-tech" },
};

export function categoryStyle(category: string) {
  return CATEGORIES[category] ?? { icon: Folder3FillIcon, color: "text-ink" };
}

export function CategoryBadge({ category, className }: { category: string; className?: string }) {
  const { icon, color } = categoryStyle(category);
  return (
    <Badge icon={icon} iconClassName={color} className={`${color} ${className ?? ""}`}>
      <span className="max-w-[16rem] truncate">{category}</span>
    </Badge>
  );
}
