"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import z from "zod";
import { AuthCard, AuthFooter, AuthHeading, FormNotice, StatusIcon, StepBadge, TextLink } from "@/components/auth/AuthCard";
import { SubmitButton } from "@/components/auth/AuthButtons";
import { PasswordCriteria } from "@/components/auth/PasswordCriteria";
import { TextField } from "@/components/auth/TextField";
import { BotGuard, useBotGuard } from "@/components/bot/BotGuard";
import { CheckFillIcon, LockFillIcon } from "@/components/icons/mingcute";
import { passwordSchema } from "@/lib/validation/auth";
import { resetPassword } from "@/server/actions/auth";

const schema = z.object({ password: passwordSchema });
type Values = z.input<typeof schema>;

// Figma "Create new password" (153:17735 / 153:17768, mobile 153:31158) then "Password reset
// successfully" (153:17866): step 3 of 3. One field with the criteria chips and the eye toggle.
// Resetting signs the account out everywhere else (the session fingerprint no longer matches).
export function NewPasswordFlow({ token }: { token: string }) {
  const [done, setDone] = useState(false);
  const [notice, setNotice] = useState<{ message: string; expired: boolean }>();
  const [focused, setFocused] = useState(false);
  const guard = useBotGuard();
  const {
    register,
    handleSubmit,
    control,
    formState: { isValid, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onChange", defaultValues: { password: "" } });
  const password = useWatch({ control, name: "password" }) ?? "";
  const field = register("password");

  async function onSubmit({ password }: Values) {
    setNotice(undefined);
    const result = await resetPassword({ token, password, ...guard.fields });
    guard.used();
    if (result.success === true) return setDone(true);
    setNotice({ message: result.message, expired: result.code === "expired" });
  }

  return (
    <>
      <StepBadge step={3} total={3} label="Nouveau mot de passe" icon={LockFillIcon} />
      {done ? (
        <AuthCard status stepKey="done">
          <StatusIcon icon={CheckFillIcon} />
          <AuthHeading title="Mot de passe réinitialisé">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</AuthHeading>
          <p className="text-center">
            <TextLink href="/auth/login">Se connecter</TextLink>
          </p>
        </AuthCard>
      ) : (
        <AuthCard stepKey="form">
          <AuthHeading title="Nouveau mot de passe">Choisissez votre nouveau mot de passe, et gardez-le précieusement cette fois !</AuthHeading>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="-mt-[0.5rem] flex flex-col gap-[2.5rem]">
            {notice && (
              <FormNotice>
                {notice.message}{" "}
                {notice.expired && (
                  <TextLink href="/auth/forgot-password" className="text-danger underline">
                    Demander un nouveau lien
                  </TextLink>
                )}
              </FormNotice>
            )}
            <div className="flex flex-col gap-4">
              <TextField
                label="Nouveau mot de passe"
                type="password"
                autoComplete="new-password"
                {...field}
                onFocus={() => setFocused(true)}
                onBlur={(e) => {
                  setFocused(false);
                  void field.onBlur(e);
                }}
              />
              <PasswordCriteria value={password} visible={focused || password.length > 0} />
            </div>
            <BotGuard {...guard.props} />
            <SubmitButton disabled={!isValid || !guard.ready} pending={isSubmitting}>
              Enregistrer le mot de passe
            </SubmitButton>
          </form>
          <AuthFooter>
            <TextLink href="/auth/login">Retour à la connexion</TextLink>
          </AuthFooter>
        </AuthCard>
      )}
    </>
  );
}
