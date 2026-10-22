"use client";
import { AnimatePresence, motion } from "motion/react";
import { createContext, useContext, useEffect, useState } from "react";
import { EASE_OUT } from "@/components/motion/easing";

// Reading progress (Figma "10% done" + ring). The page scrolls inside <main>, not the window.
// Progress = share of #article-body above the bottom of the visible area. The header copy shows
// once #article-title (which carries the in-page copy) has scrolled out of view.
const ProgressContext = createContext({ progress: 0, titleVisible: true });

export function ReadingProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [titleVisible, setTitleVisible] = useState(true);

  useEffect(() => {
    const body = document.getElementById("article-body");
    const title = document.getElementById("article-title");
    const scroller = body?.closest("main");
    if (!body || !scroller) return;

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const { top, height } = body.getBoundingClientRect();
        const bottom = scroller.getBoundingClientRect().bottom;
        const ratio = height > 0 ? (bottom - top) / height : 1;
        setProgress(Math.round(Math.min(1, Math.max(0, ratio)) * 100));
      });
    };
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const observer = title
      ? new IntersectionObserver(([entry]) => setTitleVisible(entry.isIntersecting), { root: scroller, rootMargin: "-80px 0px 0px 0px" })
      : null;
    if (title) observer?.observe(title);
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, []);

  return <ProgressContext.Provider value={{ progress, titleVisible }}>{children}</ProgressContext.Provider>;
}

// 20px ring: #F7F7F7 track, #163300 arc from the top, 1.5px stroke.
function ProgressRing({ progress }: { progress: number }) {
  const radius = 9.25;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden className="shrink-0 -rotate-90">
      <circle cx="10" cy="10" r={radius} fill="none" stroke="#f7f7f7" strokeWidth="1.5" />
      <circle
        cx="10"
        cy="10"
        r={radius}
        fill="none"
        stroke="var(--color-primary-base)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress / 100)}
        className="transition-[stroke-dashoffset] duration-300 ease-out"
      />
    </svg>
  );
}

function Indicator({ progress }: { progress: number }) {
  return (
    <span className="flex shrink-0 items-center gap-4" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Progression de la lecture">
      <span className="type-body font-medium whitespace-nowrap text-ink">
        {progress}% <span className="text-faint">lu</span>
      </span>
      <ProgressRing progress={progress} />
    </span>
  );
}

// Next to the title (desktop title row).
export function InlineProgress() {
  const { progress } = useContext(ProgressContext);
  return <Indicator progress={progress} />;
}

// In the sticky header, once the title row has scrolled away.
export function HeaderProgress() {
  const { progress, titleVisible } = useContext(ProgressContext);
  return (
    <AnimatePresence initial={false}>
      {!titleVisible && (
        <motion.span
          key="header-progress"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 8 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
        >
          <Indicator progress={progress} />
        </motion.span>
      )}
    </AnimatePresence>
  );
}
