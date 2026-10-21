"use client";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT, STAGGER } from "./easing";

type Props = { children: ReactNode; className?: string; index?: number; as?: "div" | "li" | "section" | "header" };

// Fades content up once. `index` staggers siblings (0, 1, 2…).
export function FadeUp({ children, className, index = 0, as = "div" }: Props) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * STAGGER, ease: EASE_OUT }}
    >
      {children}
    </Component>
  );
}

// Same, but waits until the element scrolls into view (for content below the fold).
export function RevealOnScroll({ children, className, index = 0, as = "div" }: Props) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * STAGGER, ease: EASE_OUT }}
    >
      {children}
    </Component>
  );
}

// The page header drops in slightly.
export function DropIn({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
