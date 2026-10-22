export const dynamic = "force-dynamic";

import { CommentModeration } from "@/components/admin/CommentModeration";
import { FadeUp } from "@/components/motion/Reveal";
import { adminOrRedirect } from "@/server/auth/guards";
import { getAdminComments } from "@/server/queries/admin";

export const metadata = { title: "Commentaires | Administration" };

// Admin › Commentaires: moderation of every comment on reads and videos. Read fresh.
export default async function AdminCommentsPage() {
  await adminOrRedirect();
  const comments = await getAdminComments();
  return (
    <FadeUp>
      <CommentModeration comments={comments} />
    </FadeUp>
  );
}
