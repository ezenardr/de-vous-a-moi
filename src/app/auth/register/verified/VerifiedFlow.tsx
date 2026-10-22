"use client";
import { signIn } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { AuthCard, AuthHeading, StatusIcon, StepBadge, TextLink } from "@/components/auth/AuthCard";
import { Dots } from "@/components/auth/AuthButtons";
import { CheckFillIcon, InformationFillIcon, UserSecurityFillIcon } from "@/components/icons/mingcute";
import { completeRegistration } from "@/server/actions/auth";

type State = { kind: "working" } | { kind: "done" } | { kind: "error"; message: string; signInInstead?: boolean };

// Figma "Account verified successfully" (153:10276, mobile 153:30178): creates the account from the
// emailed link, signs the user in with the same token, then goes home. Step 2 of 2.
export function VerifiedFlow({ token }: { token: string }) {
  const [state, setState] = useState<State>({ kind: "working" });
  const started = useRef(false);

  useEffect(() => {
    // Once, even under StrictMode's double effect (both calls would be harmless, but one is enough).
    if (started.current) return;
    started.current = true;
    (async () => {
      const created = await completeRegistration(token);
      if (created.success !== true) return setState({ kind: "error", message: created.message });
      setState({ kind: "done" });
      const result = await signIn("registration", { token, redirect: false });
      if (result?.error) {
        return setState({ kind: "error", message: "Votre compte est créé. Connectez-vous pour continuer.", signInInstead: true });
      }
      // Leave the success visible for a moment, then a full navigation so the whole site sees the session.
      setTimeout(() => window.location.replace("/"), 900);
    })();
  }, [token]);

  return (
    <>
      <StepBadge step={2} total={2} label="Vérification" icon={UserSecurityFillIcon} />
      <AuthCard status stepKey={state.kind}>
        {state.kind === "error" ? (
          <>
            <StatusIcon icon={InformationFillIcon} tone={state.signInInstead ? "success" : "danger"} />
            <AuthHeading title={state.signInInstead ? "Compte créé" : "Lien invalide"}>{state.message}</AuthHeading>
            <p className="text-center">
              {state.signInInstead ? (
                <TextLink href="/auth/login">Se connecter</TextLink>
              ) : (
                <TextLink href="/auth/register">Recommencer l&apos;inscription</TextLink>
              )}
            </p>
          </>
        ) : (
          <>
            <StatusIcon icon={state.kind === "done" ? CheckFillIcon : UserSecurityFillIcon} />
            <AuthHeading title={state.kind === "done" ? "Compte vérifié avec succès" : "Vérification de votre compte"} />
            <p className="flex items-center justify-center gap-[0.5rem] type-body font-bold text-primary-base" role="status">
              {state.kind === "done" ? "Connexion en cours" : "Un instant"}
              <Dots />
            </p>
          </>
        )}
      </AuthCard>
    </>
  );
}
