"use client";
import { AnimatePresence, motion } from "motion/react";
import { useOptimistic, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { AddReadToFavorite, RemoveReadToFavorite } from "@/action/reads";
import { BookmarksFillIcon, BookmarksLineIcon } from "@/components/icons/mingcute";
import { EASE_POP } from "@/components/motion/easing";
import { cn } from "@/lib/utils";
import { SignInPrompt } from "./SignInPrompt";

// Figma "Saves": frosted round button (10px padding, white 20px icon) in the card's top-right corner.
// Flips optimistically, pops when saved, ripples once, and rolls back if the server refuses.
export function SaveButton({ readId, saved, className }: { readId: string; saved: boolean; className?: string }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSaved, setOptimistic] = useOptimistic(saved);
  const [isPending, startTransition] = useTransition();
  const [promptOpen, setPromptOpen] = useState(false);
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
    // Logged out: explain why signing in is needed (Figma "Save read" dialog).
    return (
      <>
        <motion.button
          type="button"
          aria-label={label}
          title={label}
          whileTap={{ scale: 0.85 }}
          className={cn(classes, "cursor-pointer")}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setPromptOpen(true);
          }}
        >
          {icon}
        </motion.button>
        {/* The dialog is portalled, but React still bubbles its clicks to the card's <Link>: stop them here. */}
        <span className="contents" onClick={(e) => e.stopPropagation()}>
          <SignInPrompt open={promptOpen} onOpenChange={setPromptOpen} reason="save" />
        </span>
      </>
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
