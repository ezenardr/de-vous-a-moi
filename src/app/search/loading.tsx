import AppLayout from "@/components/layouts/AppLayout";
import { Bone, SkeletonPage, TextBone } from "@/components/skeletons/Skeleton";
import { ReadCardSkeleton, SectionHeaderSkeleton } from "@/components/skeletons/ReadSkeletons";

// Mirrors app/search/page.tsx (same layout as All reads).
export default function Loading() {
  return (
    <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
      <SkeletonPage label="Recherche en cours">
        <div className="flex shrink-0 items-center justify-between gap-4 border-canvas lg:h-[8rem] lg:border-b-[1.5px] lg:px-8">
          <TextBone line="h-[2.4rem]" className="h-[1.6rem] w-[10rem]" strong />
          <Bone className="h-[3.7rem] w-[22.5rem] rounded-card lg:h-[4.03rem] lg:w-[35rem]" />
        </div>
        <div className="flex flex-col gap-8 lg:px-8 lg:pt-[2.5rem] lg:pb-8">
          <SectionHeaderSkeleton />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }, (_, i) => (
              <ReadCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </SkeletonPage>
    </AppLayout>
  );
}
