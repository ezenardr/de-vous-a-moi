import Link from "next/link";
import { LeftLineIcon, RightLineIcon } from "@/components/icons/mingcute";

// Figma header breadcrumb ("Reads › All reads"): Medium 20 #333 labels, 20px #484848 chevron, 10px gaps.
// On mobile there is no room next to the search, so it collapses to a back chevron and the current page.
// mobileBack={false} when the page has its own mobile back button (Figma 156:49023).
export function Breadcrumb({
  parent,
  current,
  mobileBack = true,
}: {
  parent: { label: string; href: string };
  current: string;
  mobileBack?: boolean;
}) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex min-w-0 items-center gap-4 type-title font-medium text-ink">
      {mobileBack && (
        <Link href={parent.href} aria-label={`Retour : ${parent.label}`} className="shrink-0 text-label lg:hidden">
          <LeftLineIcon />
        </Link>
      )}
      <Link href={parent.href} className="hidden shrink-0 transition-colors hover:text-primary-base lg:inline">
        {parent.label}
      </Link>
      <RightLineIcon aria-hidden className="hidden shrink-0 text-label lg:block" />
      <h1 aria-current="page" className="truncate">
        {current}
      </h1>
    </nav>
  );
}
