"use server";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import z from "zod";
import { ActionError, requireAdmin, toActionError } from "@/server/auth/permissions";
import {
  MAX_CAMPAIGN_ITEMS,
  activeSubscriberCount,
  campaignRenderer,
  deliverPending,
  getCampaign,
  resumeCampaign,
  startCampaign,
} from "@/server/campaigns";
import { db } from "@/server/db";
import { newsletterCampaigns, newsletterSubscribers } from "@/server/db/schema";
import { sendNewsletterTest } from "@/server/email";
import { unsubscribeEmail, unsubscribeUrl } from "@/server/newsletter";

// Admin › Newsletter: write, test and send newsletters; manage the list. Admins only.

const fail = (error: unknown, context: string) => ({ success: false as const, ...toActionError(error, context) });

function parse<T>(schema: z.ZodType<T>, input: unknown, message = "Données invalides"): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new ActionError(message);
  return result.data;
}

const refresh = (campaignId?: string) => {
  revalidatePath("/admin/newsletter");
  if (campaignId) revalidatePath(`/admin/newsletter/${campaignId}`);
};

async function draftOrThrow(campaignId: string) {
  const campaign = await getCampaign(campaignId);
  if (!campaign) throw new ActionError("Newsletter introuvable");
  if (campaign.status !== "draft") throw new ActionError("Cette newsletter a déjà été envoyée.");
  return campaign;
}

// What must be there before a test or a real send.
function assertComplete(campaign: { subject: string; body: string }) {
  if (!campaign.subject.trim()) throw new ActionError("Ajoutez un objet avant d'envoyer.");
  if (!campaign.body.replace(/<[^>]*>/g, "").trim()) throw new ActionError("Écrivez le message avant d'envoyer.");
}

export async function CreateCampaign() {
  try {
    const admin = await requireAdmin();
    const campaignId = randomUUID();
    await db.insert(newsletterCampaigns).values({ campaignId, createdBy: admin.userId });
    refresh();
    return { success: true as const, campaignId };
  } catch (error) {
    return fail(error, "CreateCampaign");
  }
}

const fieldsSchema = z.object({
  campaignId: z.uuid(),
  // One line each: never a line break, even though Resend builds the headers (defence in depth).
  subject: z.string().trim().max(200).regex(/^[^\r\n]*$/),
  preheader: z.string().trim().max(200).regex(/^[^\r\n]*$/),
  body: z.string().max(100_000),
  items: z.array(z.object({ kind: z.enum(["read", "watch"]), id: z.uuid() })).max(MAX_CAMPAIGN_ITEMS),
});

export async function SaveCampaign(input: z.infer<typeof fieldsSchema>) {
  try {
    await requireAdmin();
    const { campaignId, ...fields } = parse(fieldsSchema, input, "Vérifiez l'objet (200 caractères max) et les contenus (4 max).");
    const updated = await db
      .update(newsletterCampaigns)
      .set({ ...fields, updatedAt: new Date() })
      .where(and(eq(newsletterCampaigns.campaignId, campaignId), eq(newsletterCampaigns.status, "draft")))
      .returning({ id: newsletterCampaigns.campaignId });
    if (updated.length === 0) throw new ActionError("Cette newsletter a déjà été envoyée.");
    refresh(campaignId);
    return { success: true as const };
  } catch (error) {
    return fail(error, "SaveCampaign");
  }
}

export async function DeleteCampaign(input: { campaignId: string }) {
  try {
    await requireAdmin();
    const { campaignId } = parse(z.object({ campaignId: z.uuid() }), input);
    const deleted = await db
      .delete(newsletterCampaigns)
      .where(and(eq(newsletterCampaigns.campaignId, campaignId), eq(newsletterCampaigns.status, "draft")))
      .returning({ id: newsletterCampaigns.campaignId });
    if (deleted.length === 0) throw new ActionError("Seul un brouillon peut être supprimé.");
    refresh();
    return { success: true as const };
  } catch (error) {
    return fail(error, "DeleteCampaign");
  }
}

// The saved draft, sent only to the admin's own address. Its unsubscribe link is a dead example.
export async function SendCampaignTest(input: { campaignId: string }) {
  try {
    const admin = await requireAdmin();
    const { campaignId } = parse(z.object({ campaignId: z.uuid() }), input);
    const campaign = await getCampaign(campaignId);
    if (!campaign) throw new ActionError("Newsletter introuvable");
    assertComplete(campaign);
    const render = await campaignRenderer(campaign);
    const example = unsubscribeUrl("exemple");
    await sendNewsletterTest({ to: admin.email, subject: campaign.subject, html: render(example), unsubscribeUrl: example });
    return { success: true as const, to: admin.email };
  } catch (error) {
    return fail(error, "SendCampaignTest");
  }
}

// Sends the saved draft to every active subscriber. `expected` is the count the admin confirmed:
// if the list changed in between, nothing is sent and the dialog shows the new number.
export async function SendCampaign(input: { campaignId: string; expected: number }) {
  try {
    await requireAdmin();
    const { campaignId, expected } = parse(z.object({ campaignId: z.uuid(), expected: z.number().int().min(0) }), input);
    const campaign = await draftOrThrow(campaignId);
    assertComplete(campaign);
    const count = await activeSubscriberCount();
    if (count === 0) throw new ActionError("La liste n'a encore aucun abonné.");
    if (count !== expected) return { success: false as const, error: `La liste compte maintenant ${count} abonnés. Vérifiez puis confirmez.`, count };
    if (!(await startCampaign(campaignId))) throw new ActionError("Cette newsletter a déjà été envoyée.");
    const result = await deliverPending(campaignId);
    refresh(campaignId);
    return { success: true as const, ...result };
  } catch (error) {
    refresh();
    return fail(error, "SendCampaign");
  }
}

// After an interruption or failures: retries what was not delivered.
export async function ResumeCampaign(input: { campaignId: string }) {
  try {
    await requireAdmin();
    const { campaignId } = parse(z.object({ campaignId: z.uuid() }), input);
    const campaign = await getCampaign(campaignId);
    if (!campaign || campaign.status === "draft") throw new ActionError("Newsletter introuvable");
    await resumeCampaign(campaignId);
    const result = await deliverPending(campaignId);
    refresh(campaignId);
    return { success: true as const, ...result };
  } catch (error) {
    return fail(error, "ResumeCampaign");
  }
}

// Removes an address from the list (kept as "unsubscribed", like the email link does).
export async function AdminUnsubscribe(input: { email: string }) {
  try {
    await requireAdmin();
    const { email } = parse(z.object({ email: z.email() }), input);
    const [row] = await db.select({ email: newsletterSubscribers.email }).from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email)).limit(1);
    if (!row) throw new ActionError("Adresse introuvable");
    await unsubscribeEmail(email);
    refresh();
    return { success: true as const };
  } catch (error) {
    return fail(error, "AdminUnsubscribe");
  }
}
