import { redirect } from "next/navigation";
import { VerifiedFlow } from "./VerifiedFlow";

export const metadata = { title: "Vérification du compte" };

// Opened from the verification email (?accessToken=…). The account is created by a POST from the
// page, not by this GET, so link scanners that only fetch the URL don't trigger anything.
export default async function VerifiedPage({ searchParams }: { searchParams: Promise<{ accessToken?: string }> }) {
  const { accessToken } = await searchParams;
  if (!accessToken) redirect("/auth/register");
  return <VerifiedFlow token={accessToken} />;
}
