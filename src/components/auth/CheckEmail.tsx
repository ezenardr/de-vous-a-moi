"use client";
import { useEffect, useState, type ReactNode } from "react";
import { MailboxFillIcon } from "@/components/icons/mingcute";
import maskEmail from "@/lib/maskEmail";
import { AuthFooter, AuthHeading, StatusIcon } from "./AuthCard";
import { Dots } from "./AuthButtons";

const COOLDOWN = 60;

// Figma "Please check your email" (153:10240, 153:17668): mailbox icon, title, description, the masked
// address in a #f8f8f8 chip, then "Didn't receive email? Resend". Resend waits 60s between sends
// (the server throttles too). guard: the page's <BotGuard> (a fresh Turnstile token for the resend);
// ready: whether that token has arrived.
export function CheckEmail({
  email,
  description,
  onResend,
  guard,
  ready = true,
}: {
  email: string;
  description: string;
  onResend: () => Promise<void>;
  guard?: ReactNode;
  ready?: boolean;
}) {
  const [wait, setWait] = useState(COOLDOWN);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  async function resend() {
    setSending(true);
    try {
      await onResend();
      setWait(COOLDOWN);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <StatusIcon icon={MailboxFillIcon} />
      <div className="flex flex-col items-center gap-[2.5rem]">
        <AuthHeading title="Vérifiez votre boîte mail">{description}</AuthHeading>
        <p className="rounded-card bg-field px-[1.6rem] py-[0.8rem] font-primary type-body text-ink">
          <span className="text-subtle">Consultez</span> <span className="font-medium">{maskEmail(email)}</span>
        </p>
      </div>
      <AuthFooter text="Pas reçu l'email ?">
        <button
          type="button"
          onClick={resend}
          disabled={wait > 0 || sending || !ready}
          className="cursor-pointer type-body font-bold text-primary-base tabular-nums underline-offset-4 enabled:hover:underline disabled:cursor-default disabled:text-faint"
        >
          {sending ? <Dots /> : wait > 0 ? `Renvoyer (${wait}s)` : "Renvoyer"}
        </button>
      </AuthFooter>
      {guard}
    </>
  );
}
