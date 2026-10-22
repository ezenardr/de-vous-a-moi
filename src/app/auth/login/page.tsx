import { redirect } from "next/navigation";
import { auth, googleClientId } from "@/lib/auth";
import { safeCallbackUrl } from "@/lib/callbackUrl";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Connexion | De vous à moi" };

// Errors Auth.js sends back here (?error=…), mostly from Google sign-in.
const NOTICES: Record<string, string> = {
  AccessDenied: "Connexion refusée. Votre adresse Google doit être vérifiée.",
  OAuthCallbackError: "La connexion avec Google a été interrompue. Veuillez réessayer.",
  OAuthSignin: "La connexion avec Google a échoué. Veuillez réessayer.",
  Configuration: "La connexion est momentanément indisponible. Veuillez réessayer plus tard.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; error?: string }> }) {
  const { callbackUrl, error } = await searchParams;
  const next = safeCallbackUrl(callbackUrl);
  // Already signed in: straight to where they were going.
  if ((await auth())?.user) redirect(next);
  const notice = error && error !== "CredentialsSignin" ? (NOTICES[error] ?? "La connexion a échoué. Veuillez réessayer.") : undefined;
  return <LoginForm callbackUrl={next} googleClientId={googleClientId} notice={notice} />;
}
