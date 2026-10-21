import type { ReactNode } from "react";
import { DropIn } from "@/components/motion/Reveal";
import { SearchField } from "./SearchField";

// Figma body header. Desktop: 80px tall, 20px side padding, 1.5px #f9f9f9 bottom border.
// Mobile: title and a 225px search on one row.
export function PageHeader({ title, search = true, children }: { title: ReactNode; search?: boolean; children?: ReactNode }) {
  return (
    <DropIn className="shrink-0">
      <header className="flex items-center justify-between gap-4 border-canvas lg:h-[8rem] lg:border-b-[1.5px] lg:px-8">
        <div className="flex min-w-0 shrink-0 items-center gap-4 type-title font-medium text-ink">{title}</div>
        <div className="flex min-w-0 items-center justify-end gap-4">
          {children}
          {search && <SearchField />}
        </div>
      </header>
    </DropIn>
  );
}
