import "server-only";
import { createHash } from "node:crypto";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { slugify } from "@/lib/Slugify";
import { db } from "@/server/db";
import { newsletterCampaigns, newsletterDeliveries, newsletterSubscribers, reads, watches } from "@/server/db/schema";
import { sendNewsletterBatch } from "@/server/email";
import { newsletterCampaignHtml, type NewsletterCard } from "@/server/email/newsletter-campaign";
import { unsubscribeUrl } from "@/server/newsletter";
import { publicRead } from "@/server/queries/reads";
import { publicWatch } from "@/server/queries/watches";

// Newsletters written in /admin/newsletter (migration 0007). Callers check Actions.admin.
//
// Sending: startCampaign() snapshots the active subscribers into newsletter_deliveries (one "pending"
// row each) and flips the campaign to "sending"; deliverPending() then claims up to 100 pending rows
// at a time, sends them in one Resend batch and marks them "sent" or "failed" ("skipped": unsubscribed
// in the meantime). When nothing is left
// to claim the campaign becomes "sent". An interrupted send resumes from the remaining rows.

export type CampaignStatus = "draft" | "sending" | "sent";
export type CampaignItemRef = { kind: "read" | "watch"; id: string };
export const MAX_CAMPAIGN_ITEMS = 4;
const BATCH = 100;

export type CampaignSummary = {
  campaignId: string;
  subject: string;
  status: CampaignStatus;
  updatedAt: string;
  sentAt: string | null;
  deliveries: { total: number; sent: number; failed: number; skipped: number; pending: number };
};

const siteUrl = () => (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/+$/, "");

const deliveryCounts = {
  total: sql<number>`(select count(*) from ${newsletterDeliveries} d where d.campaign_id = ${newsletterCampaigns.campaignId})`.mapWith(Number),
  sent: sql<number>`(select count(*) from ${newsletterDeliveries} d where d.campaign_id = ${newsletterCampaigns.campaignId} and d.status = 'sent')`.mapWith(Number),
  failed: sql<number>`(select count(*) from ${newsletterDeliveries} d where d.campaign_id = ${newsletterCampaigns.campaignId} and d.status = 'failed')`.mapWith(Number),
  skipped: sql<number>`(select count(*) from ${newsletterDeliveries} d where d.campaign_id = ${newsletterCampaigns.campaignId} and d.status = 'skipped')`.mapWith(Number),
};

export async function getCampaigns(): Promise<CampaignSummary[]> {
  const rows = await db
    .select({
      campaignId: newsletterCampaigns.campaignId,
      subject: newsletterCampaigns.subject,
      status: newsletterCampaigns.status,
      updatedAt: newsletterCampaigns.updatedAt,
      sentAt: newsletterCampaigns.sentAt,
      ...deliveryCounts,
    })
    .from(newsletterCampaigns)
    .orderBy(desc(newsletterCampaigns.updatedAt));
  return rows.map(({ total, sent, failed, skipped, updatedAt, sentAt, status, ...r }) => ({
    ...r,
    status: status as CampaignStatus,
    updatedAt: updatedAt.toISOString(),
    sentAt: sentAt?.toISOString() ?? null,
    deliveries: { total, sent, failed, skipped, pending: total - sent - failed - skipped },
  }));
}

export async function getCampaign(campaignId: string) {
  const [row] = await db
    .select({
      campaignId: newsletterCampaigns.campaignId,
      subject: newsletterCampaigns.subject,
      preheader: newsletterCampaigns.preheader,
      body: newsletterCampaigns.body,
      items: newsletterCampaigns.items,
      status: newsletterCampaigns.status,
      updatedAt: newsletterCampaigns.updatedAt,
      sentAt: newsletterCampaigns.sentAt,
      ...deliveryCounts,
    })
    .from(newsletterCampaigns)
    .where(eq(newsletterCampaigns.campaignId, campaignId))
    .limit(1);
  if (!row) return null;
  const { total, sent, failed, skipped, updatedAt, sentAt, status, ...rest } = row;
  return {
    ...rest,
    status: status as CampaignStatus,
    updatedAt: updatedAt.toISOString(),
    sentAt: sentAt?.toISOString() ?? null,
    deliveries: { total, sent, failed, skipped, pending: total - sent - failed - skipped },
  };
}
export type CampaignDetail = NonNullable<Awaited<ReturnType<typeof getCampaign>>>;

// The attached reads/videos as email cards, in the chosen order. Items no longer public are skipped.
export async function campaignCards(items: CampaignItemRef[]): Promise<NewsletterCard[]> {
  const readIds = items.filter((i) => i.kind === "read").map((i) => i.id);
  const watchIds = items.filter((i) => i.kind === "watch").map((i) => i.id);
  const [readRows, watchRows] = await Promise.all([
    readIds.length
      ? db
          .select({ id: reads.readId, title: reads.title, description: reads.description, imageUrl: reads.imageUrl })
          .from(reads)
          .where(and(inArray(reads.readId, readIds), publicRead))
      : [],
    watchIds.length
      ? db
          .select({ id: watches.watchId, title: watches.title, description: watches.description, imageUrl: watches.imageUrl })
          .from(watches)
          .where(and(inArray(watches.watchId, watchIds), publicWatch))
      : [],
  ]);
  const found = new Map([...readRows.map((r) => [`read:${r.id}`, r] as const), ...watchRows.map((w) => [`watch:${w.id}`, w] as const)]);
  return items.flatMap((item) => {
    const row = found.get(`${item.kind}:${item.id}`);
    if (!row) return [];
    const path = item.kind === "read" ? "reads" : "watches";
    return [{ kindLabel: item.kind === "read" ? "Article" : "Vidéo", title: row.title, description: row.description, imageUrl: row.imageUrl, url: `${siteUrl()}/${path}/${slugify(row.title, row.id)}` }];
  });
}

type Renderable = { subject: string; preheader: string; body: string; items: CampaignItemRef[] };

// Returns a function that renders the email for one recipient (only the unsubscribe link differs).
export async function campaignRenderer(campaign: Renderable) {
  const cards = await campaignCards(campaign.items);
  return (unsubscribe: string) =>
    newsletterCampaignHtml({ subject: campaign.subject, preheader: campaign.preheader, body: campaign.body, cards, siteUrl: siteUrl(), unsubscribeUrl: unsubscribe });
}

export const activeSubscriberCount = async () =>
  (await db.select({ n: sql<number>`count(*)`.mapWith(Number) }).from(newsletterSubscribers).where(eq(newsletterSubscribers.status, "active")))[0].n;

// Draft → sending: one pending delivery per active subscriber. Returns false if it was not a draft
// (already started by someone else), so a double click never snapshots twice.
export async function startCampaign(campaignId: string): Promise<boolean> {
  return db.transaction(async (tx) => {
    const started = await tx
      .update(newsletterCampaigns)
      .set({ status: "sending", updatedAt: new Date() })
      .where(and(eq(newsletterCampaigns.campaignId, campaignId), eq(newsletterCampaigns.status, "draft")))
      .returning({ id: newsletterCampaigns.campaignId });
    if (started.length === 0) return false;
    await tx.execute(sql`
      insert into newsletter_deliveries (campaign_id, email)
      select ${campaignId}, email from newsletter_subscribers where status = 'active'
      on conflict do nothing
    `);
    return true;
  });
}

// Claims the next batch: pending → "claimed", so a second sender running at the same time skips them.
// The CTE runs once; an `in (subquery … limit)` can be re-evaluated while rows change and claim them all.
async function claimBatch(campaignId: string): Promise<string[]> {
  const claimed = await db.execute(sql`
    with batch as (
      select email from newsletter_deliveries
      where campaign_id = ${campaignId} and status = 'pending'
      order by email limit ${BATCH}
      for update skip locked
    )
    update newsletter_deliveries d set status = 'claimed'
    from batch
    where d.campaign_id = ${campaignId} and d.email = batch.email
    returning d.email
  `);
  return (claimed.rows as { email: string }[]).map((r) => r.email);
}

export async function deliverPending(campaignId: string): Promise<{ sent: number; failed: number; skipped: number }> {
  const campaign = await getCampaign(campaignId);
  if (!campaign || campaign.status !== "sending") return { sent: 0, failed: 0, skipped: 0 };
  const render = await campaignRenderer(campaign);
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (let emails = await claimBatch(campaignId); emails.length > 0; emails = await claimBatch(campaignId)) {
    // Someone may have unsubscribed since the snapshot: they are skipped.
    const subscribers = await db
      .select({ email: newsletterSubscribers.email, token: newsletterSubscribers.unsubscribeToken })
      .from(newsletterSubscribers)
      .where(and(inArray(newsletterSubscribers.email, emails), eq(newsletterSubscribers.status, "active")));
    const active = new Map(subscribers.map((s) => [s.email, s.token]));
    const gone = emails.filter((e) => !active.has(e));
    if (gone.length) {
      await db
        .update(newsletterDeliveries)
        .set({ status: "skipped", error: "désinscrit" })
        .where(and(eq(newsletterDeliveries.campaignId, campaignId), inArray(newsletterDeliveries.email, gone)));
      skipped += gone.length;
    }

    const batch = [...active].map(([email, token]) => {
      const unsubscribe = unsubscribeUrl(token);
      return { to: email, subject: campaign.subject, html: render(unsubscribe), unsubscribeUrl: unsubscribe };
    });
    const key = `${campaignId}:${createHash("sha256").update(batch.map((m) => m.to).join(",")).digest("hex").slice(0, 32)}`;
    try {
      await sendNewsletterBatch(batch, key);
      await db
        .update(newsletterDeliveries)
        .set({ status: "sent", sentAt: new Date(), error: null })
        .where(and(eq(newsletterDeliveries.campaignId, campaignId), inArray(newsletterDeliveries.email, [...active.keys()])));
      sent += batch.length;
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0, 500) : "erreur inconnue";
      console.error("Newsletter batch failed", campaignId, message);
      if (batch.length) {
        await db
          .update(newsletterDeliveries)
          .set({ status: "failed", error: message })
          .where(and(eq(newsletterDeliveries.campaignId, campaignId), inArray(newsletterDeliveries.email, [...active.keys()])));
      }
      failed += batch.length;
    }
  }

  // Nothing left pending or claimed: the campaign is done.
  const [{ open }] = await db
    .select({ open: sql<number>`count(*)`.mapWith(Number) })
    .from(newsletterDeliveries)
    .where(and(eq(newsletterDeliveries.campaignId, campaignId), inArray(newsletterDeliveries.status, ["pending", "claimed"])));
  if (open === 0) {
    await db
      .update(newsletterCampaigns)
      .set({ status: "sent", sentAt: new Date(), updatedAt: new Date() })
      .where(and(eq(newsletterCampaigns.campaignId, campaignId), eq(newsletterCampaigns.status, "sending")));
  }
  return { sent, failed, skipped };
}

// "Reprendre l'envoi": rows stuck in "claimed" (a sender that died) and failed rows go back to
// pending, and the campaign is "sending" again.
export async function resumeCampaign(campaignId: string) {
  await db.transaction(async (tx) => {
    await tx
      .update(newsletterDeliveries)
      .set({ status: "pending", error: null })
      .where(
        and(
          eq(newsletterDeliveries.campaignId, campaignId),
          inArray(newsletterDeliveries.status, ["claimed", "failed"]),
        ),
      );
    await tx
      .update(newsletterCampaigns)
      .set({ status: "sending", updatedAt: new Date() })
      .where(and(eq(newsletterCampaigns.campaignId, campaignId), inArray(newsletterCampaigns.status, ["sending", "sent"])));
  });
}
