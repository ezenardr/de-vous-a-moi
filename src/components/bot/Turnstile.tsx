"use client";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render(el: HTMLElement, options: Record<string, unknown>): string;
  remove(id: string): void;
  reset(id: string): void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

// Cloudflare's documented always-pass test key, used locally until NEXT_PUBLIC_TURNSTILE_SITE_KEY is set.
const TEST_SITE_KEY = "1x00000000000000000000AA";
export const turnstileSiteKey =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || (process.env.NODE_ENV !== "production" ? TEST_SITE_KEY : undefined);

// Cloudflare Turnstile (used by BotGuard), "interaction-only": invisible for most visitors, a small checkbox only when
// Cloudflare wants a click. Reports a token (or null when it expires or fails).
export function Turnstile({ onToken, resetKey }: { onToken: (token: string | null) => void; resetKey?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  });

  // Wait for Cloudflare's script (loaded below, or already there from an earlier form). next/script's
  // onReady isn't reliable for a script another component already loaded, so this checks directly.
  useEffect(() => {
    const timer = setInterval(() => {
      if (!window.turnstile) return;
      clearInterval(timer);
      setReady(true);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!ready || !ref.current || !window.turnstile || !turnstileSiteKey) return;
    const id = window.turnstile.render(ref.current, {
      sitekey: turnstileSiteKey,
      appearance: "interaction-only",
      language: "fr",
      callback: (token: string) => onTokenRef.current(token),
      "expired-callback": () => onTokenRef.current(null),
      "error-callback": () => onTokenRef.current(null),
    });
    widget.current = id;
    return () => {
      window.turnstile?.remove(id);
      widget.current = null;
    };
  }, [ready]);

  // A new token after each attempt (tokens are single-use).
  useEffect(() => {
    if (resetKey && widget.current) {
      onTokenRef.current(null);
      window.turnstile?.reset(widget.current);
    }
  }, [resetKey]);

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" />
      <div ref={ref} className="empty:hidden" />
    </>
  );
}
