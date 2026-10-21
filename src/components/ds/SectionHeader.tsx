import Link from "next/link";
import { RightLineIcon } from "@/components/icons/mingcute";

// Figma section title ("Latest reads") with the "See all" text button.
export function SectionHeader({ title, href, linkLabel = "Voir tout" }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="type-section font-bold text-ink">{title}</h2>
      {href && (
        <Link href={href} className="flex items-center gap-[0.5rem] type-body-lg font-bold text-primary-base hover:underline">
          {linkLabel}
          <RightLineIcon />
        </Link>
      )}
    </div>
  );
}
