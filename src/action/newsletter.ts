"use server";

import { auth } from "@/lib/auth";
import maskEmail from "@/lib/maskEmail";
import { emailSchema } from "@/lib/validation/auth";
import { clientIp, consume, LIMITS, waitMessage } from "@/server/auth/rateLimit";
import { sendNewsletterWelcomeEmail } from "@/server/email";
import { subscribe, unsubscribeByToken, unsubscribeUrl } from "@/server/newsletter";
import { BOT_MESSAGE, botFieldsSchema, checkBot } from "@/server/botCheck";

type Result = { success: true } | { success: false; message: string };

const GENERIC_ERROR = "L'inscription a échoué. Veuillez réessayer.";

const formSchema = botFieldsSchema.extend({ email: emailSchema });

// Newsletter dialog (Figma 153:16245). Single opt-in, behind the bot checks (server/botCheck: traps
// silently "succeed" so bots learn nothing), per-IP and per-address rate limits and Turnstile. The answer never reveals whether an address was already
// on the list. Signed-in readers are already authenticated: no Turnstile, and their account is linked.
export async function subscribeNewsletter(input: unknown): Promise<Result> {
  const parsed = formSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Adresse email invalide" };
  const { email, ...bot } = parsed.data;

  try {
    const session = await auth();
    const userId = session?.user?.userId;
    const ip = await clientIp();
    const check = await checkBot(bot, ip, { turnstile: !userId });
    if (check === "trap") return { success: true };
    const wait = (await consume(LIMITS.newsletterIp, ip)) || (await consume(LIMITS.newsletterEmail, email));
    if (wait) return { success: false, message: waitMessage(wait) };
    if (check === "challenge-failed") return { success: false, message: BOT_MESSAGE };

    // A reader subscribing their own address links it to their account.
    const ownAddress = userId && session?.user?.email?.toLowerCase() === email;
    const { token, activated } = await subscribe(email, ownAddress ? userId : undefined);
    if (activated) {
      await sendNewsletterWelcomeEmail(email, unsubscribeUrl(token)).catch((error) => console.error("newsletter welcome email failed", error));
    }
    return { success: true };
  } catch (error) {
    console.error("subscribeNewsletter failed", error);
    return { success: false, message: GENERIC_ERROR };
  }
}

// From the unsubscribe page (link in every newsletter email). A POST, so scanners that only open
// links can't unsubscribe anyone.
export async function unsubscribeNewsletter(token: string): Promise<{ success: true; email: string } | { success: false; message: string }> {
  try {
    const email = await unsubscribeByToken(String(token));
    if (!email) return { success: false, message: "Ce lien de désinscription n'est pas valide." };
    // Masked: whoever holds the link learns nothing more than they need.
    return { success: true, email: maskEmail(email) };
  } catch (error) {
    console.error("unsubscribeNewsletter failed", error);
    return { success: false, message: GENERIC_ERROR };
  }
}
