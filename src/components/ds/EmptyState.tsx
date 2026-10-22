import type { ReactNode } from "react";
import { BoardFillIcon } from "@/components/icons/mingcute";

export function EmptyState({ children, icon: Icon = BoardFillIcon }: { children: ReactNode; icon?: typeof BoardFillIcon }) {
  return (
    <div className="mx-auto flex max-w-[56rem] flex-col items-center gap-8 py-20 text-center">
      <span className="flex size-[12rem] items-center justify-center rounded-pill bg-neutral-100">
        <span className="flex size-[9rem] items-center justify-center rounded-pill bg-neutral-200 text-faint">
          <Icon size={50} />
        </span>
      </span>
      <p className="type-body-lg text-faint">{children}</p>
    </div>
  );
}
