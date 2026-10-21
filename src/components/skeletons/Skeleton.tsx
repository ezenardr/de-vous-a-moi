import { cn } from "@/lib/utils";
import styles from "./skeleton.module.css";

/*
 * Building blocks for route `loading.tsx` files.
 * Rule: a skeleton copies the real page's boxes (same wrappers, paddings, image sizes) and only
 * swaps text and pictures for bones, so nothing jumps when content arrives. When a page's layout
 * changes, its skeleton changes with it. Plain markup, so they render as server components.
 */

export function Bone({ className, strong = false }: { className?: string; strong?: boolean }) {
  return <span aria-hidden className={cn("block shrink-0 rounded-chip", styles.bone, strong && styles.strong, className)} />;
}

// One line of text: a bone as tall as the glyphs, centred in the real line box.
export function TextBone({ className, line, strong = false }: { className?: string; line: string; strong?: boolean }) {
  return (
    <span aria-hidden className={cn("flex items-center", line)}>
      <Bone strong={strong} className={className} />
    </span>
  );
}

// Announces the loading state once for screen readers.
export function SkeletonPage({ label = "Chargement", children }: { label?: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className="contents">
      {children}
    </div>
  );
}
