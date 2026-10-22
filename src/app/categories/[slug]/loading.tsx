import AppLayout from "@/components/layouts/AppLayout";
import { Bone, SkeletonPage, TextBone } from "@/components/skeletons/Skeleton";
import { ReadCardSkeleton } from "@/components/skeletons/ReadSkeletons";

// Mirrors app/categories/[slug]/page.tsx.
export default function Loading() {
  return (
    <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
      <SkeletonPage label="Chargement de la catégorie">
        <Bone className="size-[4rem] shrink-0 rounded-[1rem] lg:hidden" />
        <div className="flex shrink-0 items-center justify-between gap-4 border-canvas lg:h-[8rem] lg:border-b-[1.5px] lg:px-8">
          <TextBone line="h-[2.4rem]" className="h-[1.6rem] w-[14rem] lg:w-[24rem]" strong />
          <Bone className="h-[3.7rem] w-[22.5rem] rounded-card lg:h-[4.03rem] lg:w-[35rem]" />
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:px-8 lg:pt-[2.5rem] lg:pb-8">
          {Array.from({ length: 6 }, (_, i) => (
            <ReadCardSkeleton key={i} showCategory={false} />
          ))}
        </div>
      </SkeletonPage>
    </AppLayout>
  );
}
