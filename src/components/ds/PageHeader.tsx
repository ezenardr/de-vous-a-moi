import type { ReactNode } from "react";
import { SearchField } from "./SearchField";

// Figma body header: page title left, search right. Desktop: 80px tall with a bottom border.
export function PageHeader({ title, search = true, children }: { title: ReactNode; search?: boolean; children?: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-6 border-canvas lg:h-[8rem] lg:border-b-[1.5px] lg:px-8">
      <div className="flex min-w-0 shrink-0 items-center gap-4 type-title font-medium text-ink">{title}</div>
      <div className="flex min-w-0 items-center justify-end gap-4">
        {children}
        {search && <SearchField />}
      </div>
    </header>
  );
}
