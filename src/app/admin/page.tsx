export const dynamic = "force-dynamic";

import AppLayout from "@/components/layouts/AppLayout";

import AdminPageContent from "./AdminPageContent";
import { adminOrRedirect } from "@/server/auth/guards";
import { getAllReadsForAdmin } from "@/server/queries/studio";

export default async function AdminPage() {
  await adminOrRedirect();
  const reads = await getAllReadsForAdmin();
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
