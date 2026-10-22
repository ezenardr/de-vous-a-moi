export const dynamic = "force-dynamic";

import { UserDirectory } from "@/components/admin/UserDirectory";
import { FadeUp } from "@/components/motion/Reveal";
import { adminOrRedirect } from "@/server/auth/guards";
import { getAdminUsers } from "@/server/queries/admin";

export const metadata = { title: "Utilisateurs | Administration" };

// Admin › Utilisateurs: every account. Only the owner may change roles. Read fresh.
export default async function AdminUsersPage() {
  const viewer = await adminOrRedirect();
  const users = await getAdminUsers();
  return (
    <FadeUp>
      <UserDirectory users={users} viewerId={viewer.userId} canEditRoles={viewer.role === "4"} />
    </FadeUp>
  );
}
