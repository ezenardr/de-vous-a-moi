export const dynamic = "force-dynamic";
import AppLayout from "@/components/layouts/AppLayout";
import WatchPageContent from "./WatchPageContent";
import { extractIdFromSlug } from "@/lib/Slugify";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { getWatch } from "@/server/queries/watches";

// Shared by generateMetadata and the page within one request.
const getWatchFromSlug = cache(async (slug: string) => {
  let watchId: string;
  try {
    watchId = extractIdFromSlug(slug);
  } catch {
    notFound();
  }
  const session = await auth();
  const watch = await getWatch(watchId, session?.user?.userId);
  if (!watch) notFound();
  return watch;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const watch = await getWatchFromSlug((await params).slug);
  return {
    title: watch.title,
    description: watch.description,
  };
}

export default async function WatchesOpenPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const watch = await getWatchFromSlug((await params).slug);
  return (
    <AppLayout>
      <WatchPageContent watch={watch} />
    </AppLayout>
  );
}
