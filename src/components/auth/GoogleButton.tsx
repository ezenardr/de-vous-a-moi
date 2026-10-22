"use client";
import { motion } from "motion/react";
import Image from "next/image";
import Script from "next/script";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import google from "@/assets/auth/google.svg";
import { Dots } from "./AuthButtons";

// Minimal typing of Google Identity Services' code client (https://accounts.google.com/gsi/client).
type CodeResponse = { code?: string; state?: string; error?: string };
type CodeClient = { requestCode(): void };
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initCodeClient(config: {
            client_id: string;
            scope: string;
            ux_mode: "popup";
            state: string;
            callback: (response: CodeResponse) => void;
            error_callback?: (error: { type: string }) => void;
          }): CodeClient;
        };
      };
    };
  }
}

const STATE_COOKIE = "g_state"; // read back by the "google-popup" provider (server/auth/google.ts)

function setStateCookie(value: string, maxAge: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${STATE_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Strict${secure}`;
}

// Figma "Continue with Google" (153:17582): black, 52px, 5px radius, Medium 16 white, Google logo.
// Opens Google's own sign-in popup (Google Identity Services, popup mode), which returns a one-time
// code; the server exchanges it and signs the user in. If the popup can't open (blocked, or Google's
// script hasn't loaded), falls back to the full-page redirect.
export function GoogleButton({ clientId, callbackUrl }: { clientId: string; callbackUrl: string }) {
  const [pending, setPending] = useState(false);

  const redirect = () => void signIn("google", { redirectTo: callbackUrl });

  function fail(message = "La connexion avec Google a échoué. Veuillez réessayer.") {
    setPending(false);
    setStateCookie("", 0);
    toast.error(message);
  }

  // Everything up to requestCode() runs inside the click, or browsers block the popup.
  function start() {
    setPending(true);
    const oauth2 = window.google?.accounts.oauth2;
    if (!oauth2) return redirect();
    const state = `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-", "");
    setStateCookie(state, 600);
    oauth2
      .initCodeClient({
        client_id: clientId,
        scope: "openid email profile",
        ux_mode: "popup",
        state,
        callback: async (response) => {
          if (response.error || !response.code) return fail(response.error === "access_denied" ? "Connexion avec Google annulée." : undefined);
          const result = await signIn("google-popup", { code: response.code, state: response.state, redirect: false });
          setStateCookie("", 0);
          if (result?.error) return fail();
          // A full navigation, so every part of the page sees the new session.
          window.location.replace(callbackUrl);
        },
        error_callback: (error) => {
          if (error.type === "popup_failed_to_open") return redirect();
          // The visitor closed the popup: just let them try again.
          setPending(false);
          setStateCookie("", 0);
        },
      })
      .requestCode();
  }

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        disabled={pending}
        onClick={start}
        className="flex h-[5.2rem] w-full cursor-pointer items-center justify-center gap-4 rounded-card bg-[#000] px-[2.4rem] type-body-lg font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-70"
      >
        <span className="flex size-[2.4rem] items-center justify-center">
          <Image src={google} alt="" width={17} height={17} unoptimized />
        </span>
        {pending ? <Dots /> : "Continuer avec Google"}
      </motion.button>
    </>
  );
}
