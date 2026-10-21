"use client";
import { useOptimistic, useTransition } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { AddReadToFavorite, RemoveReadToFavorite } from "@/action/reads";
import { BookmarksFillIcon, BookmarksLineIcon } from "@/components/icons/mingcute";
import NoAuthDialog from "@/components/shared/NoAuthDialog";
import { cn } from "@/lib/utils";

// Figma "Saves": frosted round button in the card's top-right corner.
export function SaveButton({ readId, saved, className }: { readId: string; saved: boolean; className?: string }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSaved, setOptimistic] = useOptimistic(saved);
  const [isPending, startTransition] = useTransition();
  const Icon = isSaved ? BookmarksFillIcon : BookmarksLineIcon;
  const classes = cn("glass-dark flex items-center rounded-pill p-4 text-white transition-opacity hover:opacity-80", className);
  const label = isSaved ? "Retirer des favoris" : "Ajouter aux favoris";

  if (!session?.user) {
    return (
      <span className={classes} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
        <NoAuthDialog>
          <span aria-label={label} className="flex cursor-pointer"><Icon /></span>
        </NoAuthDialog>
      </span>
    );
  }

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      setOptimistic(!isSaved);
      const action = isSaved ? RemoveReadToFavorite : AddReadToFavorite;
      const result = await action({ read: { readId }, pathname });
      if (!result.success) toast.error(result.error);
    });
  }

  return (
    <button type="button" onClick={toggle} disabled={isPending} aria-label={label} aria-pressed={isSaved} className={classes}>
      <Icon />
    </button>
  );
}
