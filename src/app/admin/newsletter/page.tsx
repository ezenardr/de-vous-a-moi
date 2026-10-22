export const dynamic = "force-dynamic";

import { NewsletterAdmin, type NewsletterTab } from "@/components/admin/NewsletterAdmin";
import { FadeUp } from "@/components/motion/Reveal";
import { adminOrRedirect } from "@/server/auth/guards";
import { getCampaigns } from "@/server/campaigns";
import { getAdminSubscribers } from "@/server/queries/admin";

export const metadata = { title: "Newsletter | Administration" };

// Admin › Newsletter: the newsletters and the subscriber list. Read fresh.
export default async function AdminNewsletterPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [, { tab }] = await Promise.all([adminOrRedirect(), searchParams]);
  const [campaigns, subscribers] = await Promise.all([getCampaigns(), getAdminSubscribers()]);
  const initialTab: NewsletterTab = tab === "subscribers" ? "subscribers" : "campaigns";
  return (
    <FadeUp>
      <NewsletterAdmin campaigns={campaigns} subscribers={subscribers} initialTab={initialTab} />
    </FadeUp>
  );
}
