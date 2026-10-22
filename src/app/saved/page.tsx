export const dynamic = "force-dynamic";

import AppLayout from "@/components/layouts/AppLayout";
import { auth } from "@/lib/auth";
import { getSavedReads } from "@/server/queries/reads";
import { getSavedWatches } from "@/server/queries/watches";
import { SavedBrowser, SavedSignedOut } from "./SavedBrowser";

export const metadata = { title: "Favoris | De vous à moi" };

// Figma "Saves": signed out 153:15437 (a prompt, not a redirect), empty 153:15454, reads 153:15471,
// watches 153:15583. Saved lists are per user, so they're read fresh (no shared cache).
export default async function SavedPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [session, { tab }] = await Promise.all([auth(), searchParams]);
  const userId = session?.user?.userId;

  if (!userId) {
    return (
      <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
        <SavedSignedOut />
      </AppLayout>
    );
  }

  const [reads, watches] = await Promise.all([getSavedReads(userId), getSavedWatches(userId)]);
  // Videos tab when asked, or when only videos are saved.
  const initialTab = tab === "videos" || (reads.length === 0 && watches.length > 0) ? "videos" : "reads";
  return (
    <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
      <SavedBrowser reads={reads} watches={watches} initialTab={initialTab} />
    </AppLayout>
  );
}
