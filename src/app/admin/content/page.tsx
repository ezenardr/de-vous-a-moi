export const dynamic = "force-dynamic";

import { ContentManager, type ContentTab } from "@/components/admin/ContentManager";
import { FadeUp } from "@/components/motion/Reveal";
import { adminOrRedirect } from "@/server/auth/guards";
import { getAdminContent } from "@/server/queries/admin";

export const metadata = { title: "Contenus | Administration" };

// Admin › Contenus: featured slots and every read and video, from every author. Read fresh.
export default async function AdminContentPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [, { tab }] = await Promise.all([adminOrRedirect(), searchParams]);
  const { reads, watches } = await getAdminContent();
  const initialTab: ContentTab = tab === "videos" ? "videos" : "reads";
  return (
    <FadeUp>
      <ContentManager reads={reads} watches={watches} initialTab={initialTab} />
    </FadeUp>
  );
}
