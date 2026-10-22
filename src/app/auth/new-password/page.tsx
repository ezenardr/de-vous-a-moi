import { redirect } from "next/navigation";
import { NewPasswordFlow } from "./NewPasswordFlow";

export const metadata = { title: "Nouveau mot de passe | De vous à moi" };

// Opened from the reset email (?accessToken=…); the token is checked when the form is sent.
export default async function NewPasswordPage({ searchParams }: { searchParams: Promise<{ accessToken?: string }> }) {
  const { accessToken } = await searchParams;
  if (!accessToken) redirect("/auth/forgot-password");
  return <NewPasswordFlow token={accessToken} />;
}
