"use client";
import { animate } from "motion/react";
import { useEffect, useRef } from "react";
import { EASE_OUT } from "@/components/motion/easing";
import { RevealOnScroll } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

const fr = (n: number) => n.toLocaleString("fr-FR");

// The server renders the real number. Tiles that start off-screen count up from 0 the first time
// they scroll into view; tiles already on screen keep their number (no flash back to 0), as does
// everything with reduced motion. The text is written directly, so counting never re-renders React.
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || value === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.textContent = fr(0);
    let stop: (() => void) | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        stop = animate(0, value, { duration: 1.2, ease: EASE_OUT, onUpdate: (v) => (el.textContent = fr(Math.round(v))) }).stop;
      },
      { rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      stop?.();
      el.textContent = fr(value);
    };
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      {fr(value)}
    </span>
  );
}

// Live counts in #f8f8f8 tiles: a Bold number (36, as on the category tiles; 28 when compact) and a
// Medium 14 #a3a3a3 label, plus an optional Medium 12 green hint ("+3 en 30 j"). Count up when they scroll
// into view. About page, the author studio and the admin overview.
export function StatTiles({ stats, compact = false }: { stats: { label: string; value: number; hint?: string }[]; compact?: boolean }) {
  return (
    // compact (studio): one row that scrolls sideways on phones, five columns on desktop.
    <ul
      className={cn(
        "gap-8",
        compact
          ? "-mx-4 flex snap-x snap-mandatory overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-5"
          : "grid grid-cols-1 sm:grid-cols-3",
      )}
    >
      {stats.map((stat, i) => (
        <RevealOnScroll
          as="li"
          key={stat.label}
          index={i}
          className={cn("flex flex-col gap-[0.5rem] rounded-card bg-field", compact ? "min-w-[13rem] shrink-0 snap-start p-[1.5rem] md:min-w-0" : "p-8")}
        >
          <span className={cn("leading-[1.2] font-bold text-primary-base", compact ? "text-[2.8rem] tracking-[-0.084rem]" : "text-[3.6rem] tracking-[-0.108rem]")}>
            <CountUp value={stat.value} />
          </span>
          <span className="type-body font-medium text-faint">{stat.label}</span>
          {stat.hint && <span className="text-[1.2rem] leading-[1.5] font-medium text-secondary-700">{stat.hint}</span>}
        </RevealOnScroll>
      ))}
    </ul>
  );
}
