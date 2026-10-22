import { redirect } from "next/navigation";
import { auth, googleClientId } from "@/lib/auth";
import { RegisterFlow } from "./RegisterFlow";

export const metadata = { title: "Inscription" };

export default async function RegisterPage() {
  if ((await auth())?.user) redirect("/");
  return <RegisterFlow googleClientId={googleClientId} />;
}
