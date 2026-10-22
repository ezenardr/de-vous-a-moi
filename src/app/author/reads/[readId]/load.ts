import "server-only";
import { notFound } from "next/navigation";
import { cache } from "react";
import z from "zod";
import { authorOrRedirect } from "@/server/auth/guards";
import { getStudioRead } from "@/server/queries/studio";

// The signed-in author's own read (anyone else's is a 404, like a missing one).
export const loadStudioRead = cache(async (readId: string) => {
  const user = await authorOrRedirect();
  if (!z.uuid().safeParse(readId).success) notFound();
  const item = await getStudioRead(readId, user.userId);
  if (!item) notFound();
  return { user, item };
});
