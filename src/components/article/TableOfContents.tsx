"use client";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { EASE_OUT } from "@/components/motion/easing";
import { cn } from "@/lib/utils";
import type { TocEntry } from "@/server/content/article";

// Figma "Table of contents" (153:12763): Bold 20 title, 20px, then 10px-spaced rows (10x5 padding).
// Active row: #f8f8f8 with a 15px #3d552b square and black Medium 16; others #a3a3a3 Regular 16.
export function TableOfContents({ toc }: { toc: TocEntry[] }) {
  const [active, setActive] = useState(toc[0]?.id);

  useEffect(() => {
    const headings = toc.map((t) => document.getElementById(t.id)).filter((el): el is HTMLElement => !!el);
    const scroller = headings[0]?.closest("main");
    if (!scroller) return;
    // The active section is the last heading that has passed the top quarter of the panel.
    const update = () => {
      const limit = scroller.getBoundingClientRect().top + scroller.clientHeight * 0.25;
      let current = headings[0]?.id;
      for (const heading of headings) if (heading.getBoundingClientRect().top <= limit) current = heading.id;
      setActive(current);
    };
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    return () => scroller.removeEventListener("scroll", update);
  }, [toc]);

  function go(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActive(id);
  }

  return (
    <nav aria-label="Table des matières" className="flex flex-col gap-8">
      <h2 className="type-title font-bold text-ink">Table des matières</h2>
      <ol className="flex flex-col gap-4">
        {toc.map((entry) => {
          const isActive = entry.id === active;
          return (
            <li key={entry.id} className="relative">
              {isActive && (
                <motion.span
                  layoutId="toc-active"
                  aria-hidden
                  className="absolute inset-0 rounded-card bg-field"
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                />
              )}
              <a
                href={`#${entry.id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  go(entry.id);
                }}
                className={cn(
                  "relative flex items-center gap-4 px-4 py-[0.5rem] type-body-lg transition-colors",
                  isActive ? "font-medium text-black" : "text-faint hover:text-ink",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="toc-marker"
                    aria-hidden
                    className="size-[1.5rem] shrink-0 rounded-card bg-quote-bar"
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                  />
                )}
                <span className="min-w-0 flex-1">{entry.text}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
