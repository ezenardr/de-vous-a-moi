import z from "zod";
import { Actions, can, currentUser } from "@/server/auth/permissions";
import { campaignRenderer, getCampaign } from "@/server/campaigns";
import { unsubscribeUrl } from "@/server/newsletter";

export const dynamic = "force-dynamic";

// The saved newsletter rendered exactly as it is emailed (with an example unsubscribe link), for the
// editor's sandboxed preview frame. Admins only.
export async function GET(_: Request, { params }: { params: Promise<{ campaignId: string }> }) {
  const user = await currentUser();
  if (!can(user, Actions.admin)) return new Response("Forbidden", { status: 403 });
  const { campaignId } = await params;
  if (!z.uuid().safeParse(campaignId).success) return new Response("Not found", { status: 404 });
  const campaign = await getCampaign(campaignId);
  if (!campaign) return new Response("Not found", { status: 404 });
  const render = await campaignRenderer(campaign);
  return new Response(render(unsubscribeUrl("exemple")), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}
