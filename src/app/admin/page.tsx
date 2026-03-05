import AppLayout from "@/components/layouts/AppLayout";

import AdminPageContent from "./AdminPageContent";
import { auth } from "@/lib/auth";
import { Read } from "@/types/types";

export default async function AdminPage() {
  const session = await auth();
  const request = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session?.user.accessToken}`,
      "Content-Type": "application/json",
      origin: process.env.NEXT_PUBLIC_APP_URL!,
      "Accept-Language": "fr",
    },
  });
  const response = await request.json();
  const reads: Read[] = response.reads;
  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row lg:border-b border-[#F9F9F9] items-start gap-4 lg:gap-0 lg:items-center justify-between lg:py-8">
        <span className="flex items-center gap-4 text-[2rem] font-medium leading-[120%] text-[#333333]">
          Administrateur
        </span>
      </div>
      <AdminPageContent reads={reads} />
    </AppLayout>
  );
}
