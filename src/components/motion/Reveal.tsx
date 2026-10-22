"use client";
import { createElement, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = { children: ReactNode; className?: string; index?: number; as?: "div" | "li" | "section" | "header" };

// Entrances are CSS animations (globals.css: enter-up / enter-down), so the server HTML is visible
// and animates from first paint, before and without JavaScript. Motion is kept for interactions.
const stagger = (index: number) => ({ "--i": index }) as CSSProperties;

// Fades content up once. `index` staggers siblings (0, 1, 2…).
export function FadeUp({ children, className, index = 0, as = "div" }: Props) {
  return createElement(as, { className: cn("enter-up", className), style: stagger(index) }, children);
}

// Same, but for content below the fold: it renders visible; once JavaScript runs, an element that is
// still off-screen is hidden and fades up when it scrolls into view. Without JavaScript (or with
// reduced motion) it simply stays visible.
export function RevealOnScroll({ children, className, index = 0, as = "div" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already seen: leave it alone
    el.classList.add("reveal-pending");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.remove("reveal-pending");
        el.classList.add("enter-up");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // One tag type for the ref; the rendered element is still the requested one (li, section…).
  const Tag = as as "div";
  return (
    <Tag ref={ref} className={className} style={stagger(index)}>
      {children}
    </Tag>
  );
}

// The page header drops in slightly.
export function DropIn({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("enter-down", className)}>{children}</div>;
}
