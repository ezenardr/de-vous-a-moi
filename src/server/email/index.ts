import "server-only";
import { Resend } from "resend";
import { verifyEmailHtml } from "./verify-email";

// Outside a production deployment, emails are logged instead of sent unless
// EMAIL_ALLOW_SEND=true, so local testing never mails real users by accident.
const canSend =
  process.env.VERCEL_ENV === "production" || process.env.EMAIL_ALLOW_SEND === "true";

let resend: Resend | undefined;
const client = () => (resend ??= new Resend(process.env.RESEND_API_KEY));

type Email = { from: string; to: string; subject?: string } & (
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
