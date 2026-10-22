"use client";
import { useState, useTransition } from "react";
import { unsubscribeNewsletter } from "@/action/newsletter";
import { AuthHeading, StatusIcon, TextLink } from "@/components/auth/AuthCard";
import { Button } from "@/components/ds/Button";
import { CheckFillIcon, InformationFillIcon, MailOpenFillIcon } from "@/components/icons/mingcute";

type State = { kind: "ask" } | { kind: "done"; email: string } | { kind: "error"; message: string };

// Opened from the link in a newsletter email: one button to confirm (see unsubscribeNewsletter).
export function UnsubscribeCard({ token }: { token: string }) {
  const [state, setState] = useState<State>({ kind: "ask" });
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const result = await unsubscribeNewsletter(token);
      setState(result.success ? { kind: "done", email: result.email } : { kind: "error", message: result.message });
    });
  }

  if (state.kind === "done") {
    return (
      <>
        <StatusIcon icon={CheckFillIcon} />
        <AuthHeading title="C'est fait">
          {state.email} ne recevra plus la newsletter. Vous pouvez vous réinscrire à tout moment.
        </AuthHeading>
        <p className="text-center">
          <TextLink href="/">Retour aux lectures</TextLink>
        </p>
      </>
    );
  }
  if (state.kind === "error") {
    return (
      <>
        <StatusIcon icon={InformationFillIcon} tone="danger" />
        <AuthHeading title="Lien invalide">{state.message}</AuthHeading>
        <p className="text-center">
          <TextLink href="/">Retour aux lectures</TextLink>
        </p>
      </>
    );
  }
  return (
    <>
      <StatusIcon icon={MailOpenFillIcon} />
      <AuthHeading title="Se désinscrire de la newsletter ?">Vous ne recevrez plus nos histoires par email.</AuthHeading>
      <div className="flex justify-center">
        <Button size="lg" onClick={confirm} disabled={pending}>
          {pending ? "Un instant…" : "Me désinscrire"}
        </Button>
      </div>
    </>
  );
}
