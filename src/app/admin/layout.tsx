import AppLayout from "@/components/layouts/AppLayout";
import { AdminNav } from "@/components/admin/AdminNav";
import { PageHeader } from "@/components/ds/PageHeader";
import { adminOrRedirect } from "@/server/auth/guards";

export const metadata = { robots: { index: false, follow: false } };

// The admin shell (no Figma): the site's page header and the section links stay put while the
// sections below load. The role check lives here, above every loading.tsx, so a refused visit
// is a real redirect; each page and action checks again on its own.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await adminOrRedirect();
  return (
    <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
      <PageHeader title={<h1>Administration</h1>} search={false} />
      <div className="flex flex-col gap-[3rem] lg:gap-[2.5rem] lg:px-8 lg:pt-[2.5rem] lg:pb-8">
        <AdminNav />
        {children}
      </div>
    </AppLayout>
  );
}
