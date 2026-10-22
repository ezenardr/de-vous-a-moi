"use client";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { LeftFillIcon } from "@/components/icons/mingcute";
import { HeaderProgress } from "./ReadingProgress";

// Figma article header: sticky, 80px with a 1.5px #f9f9f9 border on desktop (breadcrumb on the left);
// on mobile a 40px #f8f8f8 back button. Right side: "Share read", then the progress once scrolled.
export function ArticleHeader({ breadcrumb, share, backHref = "/" }: { breadcrumb: ReactNode; share: ReactNode; backHref?: string }) {
  const router = useRouter();

  function back() {
    // Go back when the visitor came from this site; otherwise to the list (reads by default).
    if (document.referrer.startsWith(window.location.origin) && window.history.length > 1) router.back();
    else router.push(backHref);
  }

  return (
    // Drops in with a CSS animation (globals.css), so the header is visible before hydration.
    <header
      className="enter-down sticky -top-[1.5rem] z-20 -mx-4 -mt-[1.5rem] flex shrink-0 items-center justify-between gap-4 bg-white px-4 pt-[1.5rem] pb-4 lg:top-0 lg:mx-0 lg:mt-0 lg:h-[8rem] lg:border-b-[1.5px] lg:border-canvas lg:px-8 lg:py-0"
    >
      <button
        type="button"
        onClick={back}
        aria-label="Retour"
        className="flex cursor-pointer items-center rounded-[1rem] bg-field p-4 text-ink lg:hidden"
      >
        <LeftFillIcon />
      </button>
      <div className="hidden min-w-0 lg:block">{breadcrumb}</div>
      <div className="flex shrink-0 items-center gap-4">
        {share}
        <HeaderProgress />
      </div>
    </header>
  );
}
