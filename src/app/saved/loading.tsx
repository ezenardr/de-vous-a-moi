import AppLayout from "@/components/layouts/AppLayout";
import { Bone, SkeletonPage } from "@/components/skeletons/Skeleton";
import { PageHeaderSkeleton, ReadCardSkeleton } from "@/components/skeletons/ReadSkeletons";

// Mirrors app/saved/page.tsx (signed in): header, the tabs track, then cards in rows of three.
export default function Loading() {
  return (
    <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
      <SkeletonPage label="Chargement des favoris">
        <PageHeaderSkeleton />
        <div className="flex flex-col gap-8 lg:px-8 lg:pt-[2.5rem] lg:pb-8">
          <Bone className="h-[4.1rem] w-[16.4rem] rounded-[0.75rem]" />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <ReadCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </SkeletonPage>
    </AppLayout>
  );
}
