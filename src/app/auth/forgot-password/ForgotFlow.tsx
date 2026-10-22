"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { AuthCard, AuthFooter, AuthHeading, FormNotice, StepBadge, TextLink } from "@/components/auth/AuthCard";
import { SubmitButton } from "@/components/auth/AuthButtons";
import { CheckEmail } from "@/components/auth/CheckEmail";
import { TextField } from "@/components/auth/TextField";
import { BotGuard, useBotGuard } from "@/components/bot/BotGuard";
import { GitPullRequestFillIcon, UserSecurityFillIcon } from "@/components/icons/mingcute";
import { emailSchema } from "@/lib/validation/auth";
import { requestPasswordReset } from "@/server/actions/auth";

const schema = z.object({ email: emailSchema });
type Values = z.input<typeof schema>;

// Figma "Reset password" (153:17632, mobile 153:30618) then "Please check your email" (153:17668):
// steps 1 and 2 of 3, in place. The same answer whether or not the address has an account.
export function ForgotFlow() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [notice, setNotice] = useState<string>();
  const guard = useBotGuard();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onTouched", defaultValues: { email: "" } });

  async function onSubmit({ email }: Values) {
    setNotice(undefined);
    const result = await requestPasswordReset({ email, ...guard.fields });
    guard.used();
    if (result.success === true) setSentTo(email.trim().toLowerCase());
    else setNotice(result.message);
  }

  async function resend() {
    if (!sentTo) return;
    const result = await requestPasswordReset({ email: sentTo, ...guard.fields });
    guard.used();
    if (result.success === true) toast.success("Un nouveau lien vous a été envoyé.");
    else toast.error(result.message);
  }

  if (sentTo) {
    return (
      <>
        <StepBadge step={2} total={3} label="Vérification" icon={UserSecurityFillIcon} />
        <AuthCard status stepKey="sent">
          <CheckEmail
            email={sentTo}
            description="Si un compte existe pour cette adresse, nous venons d'y envoyer un lien. Cliquez dessus pour créer un nouveau mot de passe."
            onResend={resend}
            guard={<BotGuard {...guard.props} />}
            ready={guard.ready}
          />
        </AuthCard>
      </>
    );
  }

  return (
    <>
      <StepBadge step={1} total={3} label="Demande" icon={GitPullRequestFillIcon} />
      <AuthCard tall stepKey="form">
        <AuthHeading title="Mot de passe oublié">
          Saisissez votre adresse email ci-dessous et nous vous aiderons à créer un nouveau mot de passe.
        </AuthHeading>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="-mt-[0.5rem] flex flex-col gap-[2.5rem]">
          {notice && <FormNotice>{notice}</FormNotice>}
          <TextField label="Adresse email" type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...register("email")} />
          <BotGuard {...guard.props} />
          <SubmitButton disabled={!isValid || !guard.ready} pending={isSubmitting}>
            Recevoir le lien
          </SubmitButton>
        </form>
        <AuthFooter>
          <TextLink href="/auth/login">Retour</TextLink>
        </AuthFooter>
      </AuthCard>
    </>
  );
}
