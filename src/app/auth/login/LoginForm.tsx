"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { AuthCard, AuthFooter, AuthHeading, FormNotice, OrDivider, TextLink } from "@/components/auth/AuthCard";
import { SubmitButton } from "@/components/auth/AuthButtons";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { TextField } from "@/components/auth/TextField";
import { BotGuard, useBotGuard } from "@/components/bot/BotGuard";

const schema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Adresse email invalide")),
  password: z.string().min(1, "Mot de passe requis").max(128),
});
type Values = z.infer<typeof schema>;

// Figma "Sign in" (153:17553, mobile 153:30279): heading, email, password + "Reset password",
// "Sign in", "or", Google, "Don't own an account? Sign up".
export function LoginForm({ callbackUrl, googleClientId, notice }: { callbackUrl: string; googleClientId?: string; notice?: string }) {
  const [shakes, setShakes] = useState(0);
  const guard = useBotGuard();
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onTouched", defaultValues: { email: "", password: "" } });

  async function onSubmit(values: Values) {
    // Credentials travel as strings; the bot-check fields ride along (server/botCheck).
    const { turnstileToken = "", website = "", openedAt } = guard.fields;
    const result = await signIn("credentials", { ...values, turnstileToken, website, openedAt: String(openedAt), redirect: false });
    guard.used();
    if (result?.error) {
      setError("password", {
        message:
          result.code === "rate_limited"
            ? "Trop de tentatives. Réessayez dans quelques minutes ou réinitialisez votre mot de passe."
            : result.code === "bot_check"
              ? "La vérification anti-robot a échoué. Veuillez réessayer."
              : "Email ou mot de passe incorrect.",
      });
      setShakes((n) => n + 1);
      return;
    }
    setDone(true);
    // A full navigation, so every part of the page (nav, server components) sees the new session.
    window.location.replace(callbackUrl);
  }

  return (
    <AuthCard>
      <AuthHeading title="Bon retour">
        Reprenez là où vous vous étiez arrêté : vos lectures sauvegardées, vos réflexions, votre espace.
      </AuthHeading>
      {/* Each failed attempt flips the keyframes, so the shake replays. */}
      <motion.form
        initial={false}
        animate={{ x: shakes % 2 ? [0, -8, 8, -5, 5, 0] : [0, 8, -8, 5, -5, 0] }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="-mt-[0.5rem] flex flex-col gap-[2.5rem]"
      >
        {notice && <FormNotice>{notice}</FormNotice>}
        <div className="flex flex-col gap-[1.5rem]">
          <TextField label="Adresse email" type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...register("email")} />
          <div className="flex flex-col items-end gap-4">
            <TextField label="Mot de passe" type="password" autoComplete="current-password" error={errors.password?.message} {...register("password")} />
            <TextLink href="/auth/forgot-password">Mot de passe oublié ?</TextLink>
          </div>
        </div>
        <BotGuard {...guard.props} />
        <SubmitButton disabled={!isValid || !guard.ready} pending={isSubmitting || done}>
          Se connecter
        </SubmitButton>
      </motion.form>
      {googleClientId && <OrDivider />}
      <div className="flex flex-col gap-[1.5rem]">
        {googleClientId && <GoogleButton clientId={googleClientId} callbackUrl={callbackUrl} />}
        <AuthFooter text="Pas encore de compte ?">
          <TextLink href="/auth/register">S&apos;inscrire</TextLink>
        </AuthFooter>
      </div>
    </AuthCard>
  );
}
