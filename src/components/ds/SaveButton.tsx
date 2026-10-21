"use client";
import { AnimatePresence, motion } from "motion/react";
import { useOptimistic, useTransition } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { AddReadToFavorite, RemoveReadToFavorite } from "@/action/reads";
import { BookmarksFillIcon, BookmarksLineIcon } from "@/components/icons/mingcute";
import { EASE_POP } from "@/components/motion/easing";
import NoAuthDialog from "@/components/shared/NoAuthDialog";
import { cn } from "@/lib/utils";

// Figma "Saves": frosted round button (10px padding, white 20px icon) in the card's top-right corner.
// Flips optimistically, pops when saved, ripples once, and rolls back if the server refuses.
export function SaveButton({ readId, saved, className }: { readId: string; saved: boolean; className?: string }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSaved, setOptimistic] = useOptimistic(saved);
  const [isPending, startTransition] = useTransition();
  const Icon = isSaved ? BookmarksFillIcon : BookmarksLineIcon;
  const label = isSaved ? "Retirer des favoris" : "Ajouter aux favoris";
  const classes = cn("glass-dark relative flex items-center rounded-pill p-4 text-white", className);

  const icon = (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={isSaved ? "saved" : "unsaved"}
        className="flex"
        initial={{ scale: 0.4, opacity: 0, y: isSaved ? -6 : 0 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.4, opacity: 0 }}
        transition={{ duration: 0.3, ease: EASE_POP }}
      >
        <Icon />
      </motion.span>
    </AnimatePresence>
  );

  if (!session?.user) {
    return (
      <span
        className={classes}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <NoAuthDialog>
          <motion.span aria-label={label} className="flex cursor-pointer" whileTap={{ scale: 0.85 }}>
            {icon}
          </motion.span>
        </NoAuthDialog>
      </span>
    );
  }

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;
    startTransition(async () => {
      setOptimistic(!isSaved);
      const action = isSaved ? RemoveReadToFavorite : AddReadToFavorite;
      const result = await action({ read: { readId }, pathname });
      if (!result.success) toast.error(result.error);
    });
  }

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={isSaved}
      title={label}
      whileTap={{ scale: 0.85 }}
      className={cn(classes, "cursor-pointer")}
    >
      {icon}
      {/* initial={false}: only ripple when the visitor saves, not for cards that load already saved. */}
      <AnimatePresence initial={false}>
        {isSaved && (
          <motion.span
            key="ripple"
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-pill border-2 border-white"
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1.8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}
