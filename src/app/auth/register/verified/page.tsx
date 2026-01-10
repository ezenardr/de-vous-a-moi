import { redirect } from "next/navigation";
import VerifiedPageContent from "./VerifiedPageContent";

export default async function VerifiedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const accessToken = (await searchParams).accessToken;
  if (!accessToken || accessToken.length === 0) {
    redirect("/register");
  }
  return <VerifiedPageContent accessToken={accessToken} />;
}
