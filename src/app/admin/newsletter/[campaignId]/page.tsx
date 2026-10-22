export const dynamic = "force-dynamic";
// Sending runs inside the "Envoyer" server action: give it time for a large list (batches of 100).
export const maxDuration = 300;

import { notFound } from "next/navigation";
import z from "zod";
import { CampaignEditor } from "@/components/admin/CampaignEditor";
import { FadeUp } from "@/components/motion/Reveal";
import { adminOrRedirect } from "@/server/auth/guards";
import { activeSubscriberCount, getCampaign } from "@/server/campaigns";
import { getNewsletterPickable } from "@/server/queries/admin";

export const metadata = { title: "Newsletter | Administration" };

// Admin › Newsletter › one newsletter: the editor for a draft, the delivery report once sent.
export default async function AdminCampaignPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const [admin, { campaignId }] = await Promise.all([adminOrRedirect(), params]);
  if (!z.uuid().safeParse(campaignId).success) notFound();
  const [campaign, pickable, subscriberCount] = await Promise.all([getCampaign(campaignId), getNewsletterPickable(), activeSubscriberCount()]);
  if (!campaign) notFound();
  return (
    <FadeUp>
      <CampaignEditor campaign={campaign} pickable={pickable} subscriberCount={subscriberCount} adminEmail={admin.email} />
    </FadeUp>
  );
}
