import "server-only";
import z from "zod";
import { verifyTurnstile } from "./turnstile";

// Bot checks for every form a signed-out visitor can send (sign in, sign up, password reset,
// newsletter). The page sends three extra fields (see components/bot/BotGuard):
// - website: a honeypot input hidden from people; bots fill it in
// - openedAt: when the form appeared; people take a few seconds, scripts don't
// - turnstileToken: Cloudflare Turnstile's proof, verified with Cloudflare
export const botFieldsSchema = z.object({
  turnstileToken: z.string().max(2048).optional(),
  website: z.string().max(200).optional(),
  openedAt: z.coerce.number().int().optional(),
});
export type BotFields = z.infer<typeof botFieldsSchema>;

export const MIN_FILL_MS = 2500;
export const BOT_MESSAGE = "La vérification anti-robot a échoué. Veuillez réessayer.";

// "trap": the honeypot or the timer caught a bot; callers answer as if everything went well (or with
// their usual generic error) so it learns nothing. "challenge-failed": Turnstile said no; callers
// show BOT_MESSAGE. turnstile: false skips Cloudflare (signed-in readers are already authenticated).
export async function checkBot(fields: BotFields, ip: string, { turnstile = true } = {}): Promise<"ok" | "trap" | "challenge-failed"> {
  if (fields.website) return "trap";
  if (typeof fields.openedAt === "number" && Date.now() - fields.openedAt < MIN_FILL_MS) return "trap";
  if (!turnstile) return "ok";
  return (await verifyTurnstile(fields.turnstileToken, ip)) ? "ok" : "challenge-failed";
}
