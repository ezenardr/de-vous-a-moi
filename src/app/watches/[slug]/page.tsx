import AppLayout from "@/components/layouts/AppLayout";
import { Watch } from "@/types/types";
import WatchPageContent from "./WatchPageContent";
import { extractIdFromSlug } from "@/lib/Slugify";
import { Metadata } from "next";

async function getWatch(id: string): Promise<{ watch: Watch }> {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/watches/${id}/related`,
    { method: "GET" },
  );
  return request.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const watchId = extractIdFromSlug(slug);
  const { watch } = await getWatch(watchId);

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
  const { slug } = await params;
  const watchId = extractIdFromSlug(slug);
  const { watch } = await getWatch(watchId);
  return (
    <AppLayout>
      <WatchPageContent watch={watch} />
    </AppLayout>
  );
}
