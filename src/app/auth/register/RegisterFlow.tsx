"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { AuthCard, AuthFooter, AuthHeading, FormNotice, OrDivider, StepBadge, TextLink } from "@/components/auth/AuthCard";
import { SubmitButton } from "@/components/auth/AuthButtons";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { CheckEmail } from "@/components/auth/CheckEmail";
import { PasswordCriteria } from "@/components/auth/PasswordCriteria";
import { TextField } from "@/components/auth/TextField";
import { BotGuard, useBotGuard } from "@/components/bot/BotGuard";
import { Pen2FillIcon, UserSecurityFillIcon } from "@/components/icons/mingcute";
import { registerSchema } from "@/lib/validation/auth";
import { register as registerAccount } from "@/server/actions/auth";

type Values = z.input<typeof registerSchema>;

// Figma "Sign up" (153:10195 / 153:10352, mobile 153:28101) then "Please check your email" (153:10240):
// step 1 of 2 is the form, step 2 the email check, in place, so the address never goes into the URL.
// The values stay in memory only, for "Resend".
export function RegisterFlow({ googleClientId }: { googleClientId?: string }) {
  const [sentTo, setSentTo] = useState<Values | null>(null);
  const [notice, setNotice] = useState<string>();
  const [passwordFocused, setPasswordFocused] = useState(false);
  const guard = useBotGuard();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isValid, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });
  const password = useWatch({ control, name: "password" }) ?? "";
  const passwordField = register("password");

  async function onSubmit(values: Values) {
    setNotice(undefined);
    const result = await registerAccount({ ...values, ...guard.fields });
    guard.used();
    if (result.success === true) return setSentTo(values);
    if (result.field === "email") setError("email", { message: result.message });
    else setNotice(result.message);
  }

  async function resend() {
    if (!sentTo) return;
    const result = await registerAccount({ ...sentTo, ...guard.fields });
    guard.used();
    if (result.success === true) toast.success("Un nouveau lien vous a été envoyé.");
    else toast.error(result.message);
  }

  if (sentTo) {
    return (
      <>
        <StepBadge step={2} total={2} label="Vérification" icon={UserSecurityFillIcon} />
        <AuthCard status stepKey="sent">
          <CheckEmail
            email={sentTo.email}
            description="Nous avons envoyé un lien de vérification à votre adresse email. Cliquez dessus pour confirmer votre compte."
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
      <StepBadge step={1} total={2} label="Inscription" icon={Pen2FillIcon} />
      <AuthCard stepKey="form">
        <AuthHeading title="Créez votre compte">
          Commencez un voyage fait d&apos;histoires partagées, de réflexions et de moments qui vous parlent.
        </AuthHeading>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="-mt-[0.5rem] flex flex-col gap-[2.5rem]">
          {notice && <FormNotice>{notice}</FormNotice>}
          <div className="flex flex-col gap-[1.5rem]">
            <div className="flex gap-4">
              <TextField label="Prénom" autoComplete="given-name" error={errors.firstName && "Prénom requis"} {...register("firstName")} />
              <TextField label="Nom" autoComplete="family-name" error={errors.lastName && "Nom requis"} {...register("lastName")} />
            </div>
            <TextField label="Adresse email" type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...register("email")} />
            <div className="flex flex-col gap-4">
              <TextField
                label="Créer un mot de passe"
                type="password"
                autoComplete="new-password"
                {...passwordField}
                onFocus={() => setPasswordFocused(true)}
                onBlur={(e) => {
                  setPasswordFocused(false);
                  void passwordField.onBlur(e);
                }}
              />
              <PasswordCriteria value={password} visible={passwordFocused || password.length > 0} />
            </div>
          </div>
          <BotGuard {...guard.props} />
          <SubmitButton disabled={!isValid || !guard.ready} pending={isSubmitting}>
            Créer mon compte
          </SubmitButton>
        </form>
        {googleClientId && <OrDivider />}
        <div className="flex flex-col gap-[1.5rem]">
          {googleClientId && <GoogleButton clientId={googleClientId} callbackUrl="/" />}
          <AuthFooter text="Déjà un compte ?">
            <TextLink href="/auth/login">Se connecter</TextLink>
          </AuthFooter>
        </div>
      </AuthCard>
    </>
  );
}
