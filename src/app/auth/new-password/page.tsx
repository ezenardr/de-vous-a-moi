import { redirect } from "next/navigation";
import NewPasswordContent from "./NewPasswordContent";
export const dynamic = "force-dynamic";
export default async function NewPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const token = (await searchParams).accessToken;
  if (!token)
    redirect(
      "/auth/forgot-password?entity=Mot de passe oublié&currentStep=1&totalStep=3",
    );
  return <NewPasswordContent token={token} />;
}
