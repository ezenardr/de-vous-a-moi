"use client";
import { TabsContent } from "@/components/ui/tabs";
import { Read, User } from "@/types/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formaDate } from "@/lib/formatDate";
import ToggleIcon from "@/components/shared/ToggleIcon";
import { useState } from "react";
import { SetFeatured } from "@/action/reads";
import { useSession } from "next-auth/react";
import PageLoader from "@/components/loaders/PageLoader";
import { toast } from "sonner";
import { Star, ArrowLeftRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const MAX_FEATURED = 2;

export default function ReadTabsContent({ reads }: { reads: Read[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [localReads, setLocalReads] = useState<Read[]>(reads);
  const [swapCandidate, setSwapCandidate] = useState<Read | null>(null);
  const { data: session } = useSession();

  const featuredReads = localReads.filter((r) => r.featured);
  const featuredCount = featuredReads.length;

  async function callSetFeatured(read: Read, featured: boolean) {
    return await SetFeatured({
      user: session?.user as User,
      read,
      featured,
    });
  }

  async function handleToggle(read: Read, wantFeatured: boolean) {
    // Unfeaturing: backend blocks if only 2 remain
    if (!wantFeatured) {
      if (featuredCount <= MAX_FEATURED) {
        toast.warning("Il faut un minimum de 2 articles en vedette.");
        return;
      }
      await applyFeatured(read, false);
      return;
    }

    // Featuring: if already at max, open swap picker
    if (featuredCount >= MAX_FEATURED) {
      setSwapCandidate(read);
      return;
    }

    await applyFeatured(read, true);
  }

  async function applyFeatured(read: Read, featured: boolean) {
    // Optimistic update
    setLocalReads((prev) =>
      prev.map((r) => (r.readId === read.readId ? { ...r, featured } : r)),
    );
    setIsLoading(true);

    const result = await callSetFeatured(read, featured);

    if (result.success !== true) {
      // Rollback
      setLocalReads((prev) =>
        prev.map((r) =>
          r.readId === read.readId ? { ...r, featured: !featured } : r,
        ),
      );
      toast.error(result.error);
    }

    setIsLoading(false);
  }

  async function handleSwap(toRemove: Read) {
    if (!swapCandidate) return;
    const incoming = swapCandidate;
    setSwapCandidate(null);
    setIsLoading(true);

    // Optimistic: unfeature old, feature new
    setLocalReads((prev) =>
      prev.map((r) => {
        if (r.readId === toRemove.readId) return { ...r, featured: false };
        if (r.readId === incoming.readId) return { ...r, featured: true };
        return r;
      }),
    );

    // Step 1: unfeature the replaced article
    const removeResult = await callSetFeatured(toRemove, false);
    if (removeResult.success !== true) {
      // Full rollback
      setLocalReads((prev) =>
        prev.map((r) => {
          if (r.readId === toRemove.readId) return { ...r, featured: true };
          if (r.readId === incoming.readId) return { ...r, featured: false };
          return r;
        }),
      );
      toast.error(removeResult.error);
      setIsLoading(false);
      return;
    }

    // Step 2: feature the new article
    const addResult = await callSetFeatured(incoming, true);
    if (addResult.success !== true) {
      // Partial rollback: restore the one we just removed
      setLocalReads((prev) =>
        prev.map((r) => {
          if (r.readId === toRemove.readId) return { ...r, featured: true };
          if (r.readId === incoming.readId) return { ...r, featured: false };
          return r;
        }),
      );
      toast.error(addResult.error);
      setIsLoading(false);
      return;
    }

    toast.success(
      `"${incoming.title}" remplace "${toRemove.title}" en vedette.`,
    );
    setIsLoading(false);
  }

  const sortedReads = [...localReads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <Dialog
        modal={!!swapCandidate}
        open={!!swapCandidate}
        onOpenChange={(open) => {
          if (!open) setSwapCandidate(null);
        }}
      >
        <DialogContent className="max-h-[90vh] lg:max-w-[520px] overflow-hidden flex flex-col gap-10">
          <DialogTitle className="flex items-center gap-3 text-[1.6rem] leading-[130%] tracking-[-0.48px] font-semibold">
            <ArrowLeftRight className="w-6 h-6 text-primary-base shrink-0" />
            Remplacer un article en vedette
          </DialogTitle>

          <div className="flex flex-col gap-3">
            <p className="font-secondary text-[1.2rem] leading-[145%] tracking-[-0.36px] text-muted-foreground">
              Choisissez lequel remplacer par{" "}
              <span className="font-medium text-foreground">
                {swapCandidate?.title}
              </span>
            </p>

            <div className="flex flex-col gap-3 mt-2">
              {featuredReads.map((featured) => (
                <button
                  key={featured.readId}
                  onClick={() => handleSwap(featured)}
                  className="flex items-center gap-4 w-full text-left px-5 py-4 rounded-xl border border-border hover:border-primary-base hover:bg-primary-base/5 transition-all group"
                >
                  <Star className="w-5 h-5 fill-primary-base text-primary-base shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-secondary font-medium text-[1.2rem] leading-[145%] tracking-[-0.36px] truncate group-hover:text-primary-base transition-colors">
                      {featured.title}
                    </p>
                    <p className="text-[1rem] leading-[145%] text-muted-foreground mt-0.5">
                      {featured.user.firstName} {featured.user.lastName} ·{" "}
                      {formaDate(featured.createdAt).toUpperCase()}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-[1rem] leading-[145%] text-muted-foreground text-center mt-2">
              L&apos;article sélectionné sera retiré des articles en vedette.
            </p>
          </div>
        </DialogContent>
      </Dialog>
      <TabsContent value="reads" className="w-full h-full overflow-y-scroll">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[200px] lg:w-auto">Titre</TableHead>
              <TableHead className="hidden lg:table-cell">Autheur</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead className="text-right">Vedette</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedReads.map((read) => (
              <TableRow
                key={read.readId}
                className={read.featured ? "bg-primary-base/5" : undefined}
              >
                <TableCell className="font-medium max-w-[200px] overflow-hidden">
                  <div className="flex items-center gap-2">
                    {read.featured && (
                      <Star className="w-3.5 h-3.5 fill-primary-base text-primary-base shrink-0" />
                    )}
                    <span className="truncate">{read.title}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {read.user.firstName} {read.user.lastName}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {formaDate(read.createdAt).toUpperCase()}
                </TableCell>
                <TableCell className="text-right">
                  <label
                    title={
                      !read.featured && featuredCount >= MAX_FEATURED
                        ? "Choisir pour remplacer un article en vedette"
                        : read.featured
                          ? "Retirer de la vedette"
                          : "Mettre en vedette"
                    }
                    className={`relative inline-block h-12 w-20 rounded-full transition [-webkit-tap-highlight-color:transparent]
                      ${isLoading ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                      bg-[#E8E8E8] has-checked:bg-primary-base`}
                  >
                    <input
                      className="peer sr-only"
                      id={`featured-${read.readId}`}
                      checked={read.featured}
                      name={`featured-${read.readId}`}
                      type="checkbox"
                      onChange={(e) => handleToggle(read, e.target.checked)}
                      disabled={isLoading}
                    />
                    <ToggleIcon />
                  </label>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
    </>
  );
}
