import { redirect } from "next/navigation";
import VerifyEmailContent from "./VerifyEmailContent";
export const dynamic = "force-dynamic";
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const email = (await searchParams).email;
  if (!email)
    redirect("/auth/register?entity=Inscription&currentStep=1&totalStep=2");
  return <VerifyEmailContent email={decodeURIComponent(email)} />;
}
