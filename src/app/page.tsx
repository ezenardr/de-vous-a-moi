import AppLayout from "@/components/layouts/AppLayout";
import { auth } from "@/lib/auth";
import Image from "next/image";

export default async function Home() {
  const session = await auth();
  return (
    <AppLayout>
      <span className="text-primary-base">{session?.user.email}</span>
    </AppLayout>
  );
}
