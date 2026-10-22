export const dynamic = "force-dynamic";

import { RecentCommentsPanel, RecentUsersPanel, ScheduledPanel, TopContentPanel } from "@/components/admin/OverviewPanels";
import { StatTiles } from "@/components/ds/StatTiles";
import { FadeUp } from "@/components/motion/Reveal";
import { adminOrRedirect } from "@/server/auth/guards";
import { getAdminOverview } from "@/server/queries/admin";

export const metadata = { title: "Administration" };

const recent = (n: number) => (n > 0 ? `+${n.toLocaleString("fr-FR")} en 30 j` : "aucun en 30 j");

// Admin overview (no Figma): the site's headline numbers, then the most viewed content, what is
// scheduled, the latest comments and the latest sign-ups. Read fresh on every visit.
export default async function AdminOverviewPage() {
  await adminOrRedirect();
  const { totals, top, scheduled, comments, users } = await getAdminOverview();

  return (
    <>
      <FadeUp>
        <StatTiles
          compact
          stats={[
            { label: "utilisateurs", value: totals.users, hint: recent(totals.newUsers) },
            { label: "abonnés newsletter", value: totals.subscribers, hint: recent(totals.newSubscribers) },
            { label: "vues", value: totals.views },
            { label: "j'aime", value: totals.likes, hint: recent(totals.newLikes) },
            { label: "commentaires", value: totals.comments, hint: recent(totals.newComments) },
          ]}
        />
      </FadeUp>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <FadeUp index={1}>
          <TopContentPanel items={top} />
        </FadeUp>
        <FadeUp index={2}>
          <RecentCommentsPanel comments={comments} href="/admin/comments" />
        </FadeUp>
        <FadeUp index={3}>
          <RecentUsersPanel users={users} href="/admin/users" />
        </FadeUp>
        <FadeUp index={4}>
          <ScheduledPanel items={scheduled} />
        </FadeUp>
      </div>
    </>
  );
}
