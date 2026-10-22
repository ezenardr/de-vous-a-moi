import "server-only";
import { Resend } from "resend";
import { newsletterWelcomeHtml } from "./newsletter-welcome";
import { verifyEmailHtml } from "./verify-email";

// Outside a production deployment, emails are logged instead of sent unless
// EMAIL_ALLOW_SEND=true, so local testing never mails real users by accident.
const canSend =
  process.env.VERCEL_ENV === "production" || process.env.EMAIL_ALLOW_SEND === "true";

let resend: Resend | undefined;
const client = () => (resend ??= new Resend(process.env.RESEND_API_KEY));

type Email = { from: string; to: string; subject?: string; headers?: Record<string, string> } & (
  | { html: string }
  | { template: { id: string; variables?: Record<string, string> } }
);

async function send(email: Email) {
  if (!canSend) {
    const detail = "html" in email ? email.subject : `template ${email.template.id} ${JSON.stringify(email.template.variables ?? {})}`;
    console.info(`[email:not-sent] to=${email.to} ${detail}`);
    return;
  }
  const { error } = await client().emails.send(email as Parameters<Resend["emails"]["send"]>[0]);
  if (error) throw new Error(`Email failed: ${error.message}`);
}

export function sendVerificationEmail(to: string, firstName: string, verificationUrl: string) {
  if (!canSend) console.info(`[email:not-sent] verification link: ${verificationUrl}`);
  return send({
    from: "Onboarding - De vous à moi <auth@messarae.com>",
    to,
    subject: "Veuillez confirmer votre adresse email",
    html: verifyEmailHtml({ firstName, verificationUrl }),
  });
}

export function sendWelcomeEmail(to: string) {
  return send({
    from: "Onboarding - De vous à moi <hello@messarae.com>",
    to,
    template: { id: "email-welcome" },
  });
}

export function sendPasswordResetEmail(to: string, firstName: string, link: string) {
  return send({
    from: "De vous à moi <auth@messarae.com>",
    to,
    template: { id: "forgot-password", variables: { FIRSTNAME: firstName, LINK: link } },
  });
}

export function sendPasswordChangedEmail(to: string, firstName: string, link: string) {
  return send({
    from: "De vous à moi <account@messarae.com>",
    to,
    template: { id: "password-changed", variables: { FIRSTNAME: firstName, LINK: link } },
  });
}

// Newsletter welcome, with one-click unsubscribe headers (RFC 8058): mail apps show an
// "Unsubscribe" button that POSTs to the link (app/api/newsletter/unsubscribe).
export function sendNewsletterWelcomeEmail(to: string, unsubscribeUrl: string) {
  const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/+$/, "");
  const oneClick = unsubscribeUrl.replace("/newsletter/unsubscribe", "/api/newsletter/unsubscribe");
  return send({
    from: "De vous à moi <newsletter@messarae.com>",
    to,
    subject: "Bienvenue dans notre cercle de lecteurs",
    html: newsletterWelcomeHtml({ siteUrl, unsubscribeUrl }),
    headers: { "List-Unsubscribe": `<${oneClick}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  });
}
