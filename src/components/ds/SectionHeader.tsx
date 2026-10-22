import Link from "next/link";
import { RightLineIcon } from "@/components/icons/mingcute";

// Figma section title ("Latest reads": Bold 20 mobile / 24 desktop, black) and its
// "Button / texts" link (Bold 16 #163300, 20px chevron).
// The chevron is #1E63F8 while the label is green: intentional (confirmed by the owner).
export function SectionHeader({ title, href, linkLabel = "Voir tout" }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="min-w-0 flex-1 type-title font-bold text-heading lg:type-section lg:font-bold">{title}</h2>
      {href && (
        <Link
          href={href}
          className="group/link flex shrink-0 items-center gap-[0.5rem] rounded-[0.8rem] type-body-lg font-bold text-primary-base"
        >
          {linkLabel}
          <RightLineIcon className="text-cat-tech transition-transform duration-300 group-hover/link:translate-x-[0.3rem]" />
        </Link>
      )}
    </div>
  );
}
