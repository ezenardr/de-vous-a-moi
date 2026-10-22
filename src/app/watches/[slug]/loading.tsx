import AppLayout from "@/components/layouts/AppLayout";
import { Bone, SkeletonPage, TextBone } from "@/components/skeletons/Skeleton";
import { ReadCardSkeleton, SectionHeaderSkeleton } from "@/components/skeletons/ReadSkeletons";

// Mirrors app/watches/[slug]/page.tsx (same wrappers, sizes and spacing) so nothing jumps on load.
export default function Loading() {
  return (
    <AppLayout className="gap-[1.5rem] pt-[1.5rem] lg:gap-0 lg:p-0">
      <SkeletonPage label="Chargement de la vidéo">
        <div className="-mx-4 -mt-[1.5rem] flex shrink-0 items-center justify-between gap-4 px-4 pt-[1.5rem] pb-4 lg:mx-0 lg:mt-0 lg:h-[8rem] lg:border-b-[1.5px] lg:border-canvas lg:px-8 lg:py-0">
          <Bone className="size-[4rem] rounded-[1rem] lg:hidden" />
          <TextBone line="hidden lg:flex h-[2.4rem]" className="h-[1.6rem] w-[38rem]" strong />
          <span className="flex items-center gap-4 lg:gap-8">
            <Bone className="h-[4rem] w-[12.8rem] rounded-card" />
            <Bone className="h-[4rem] w-[11.4rem] rounded-card" />
          </span>
        </div>
        <div className="flex flex-col lg:px-8 lg:pt-[2.5rem] lg:pb-8">
          <div className="flex flex-col gap-[1.5rem]">
            <Bone className="h-[35rem] w-full rounded-card lg:h-[40rem]" />
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
                <TextBone line="h-[2.61rem] lg:h-[2.88rem]" className="h-[1.5rem] w-3/4 lg:h-[1.9rem] lg:w-[50rem]" strong />
                <span className="flex gap-[0.5rem]">
                  <Bone className="h-[2.5rem] w-[11rem] rounded-chip" />
                  <Bone className="h-[2.5rem] w-[5.6rem] rounded-chip" />
                  <Bone className="h-[2.5rem] w-[6.8rem] rounded-chip" />
                </span>
              </div>
              <span className="flex items-center gap-[0.5rem]">
                <Bone className="size-[3rem] rounded-pill" />
                <TextBone line="h-[2.32rem]" className="h-[1.3rem] w-[12rem]" />
              </span>
              <TextBone line="h-[2.03rem]" className="h-[1.1rem] w-full lg:max-w-[60rem]" />
            </div>
          </div>
          <div className="mt-[2.5rem] flex flex-col gap-[3rem] border-t border-divider pt-[3.5rem] lg:mt-[3.5rem] lg:flex-row lg:border-0 lg:pt-0">
            <div className="flex w-full shrink-0 flex-col lg:w-[40rem]">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-divider py-[1.5rem] first:pt-0 [&:not(:first-child)]:border-t">
                  <TextBone line="h-[2.03rem]" className="h-[1.1rem] w-[8rem]" />
                  <TextBone line="h-[2.03rem]" className="h-[1.1rem] w-[5rem]" />
                </div>
              ))}
            </div>
            <div className="flex flex-1 flex-col gap-8">
              <TextBone line="h-[2.4rem]" className="h-[1.6rem] w-[16rem]" strong />
              <Bone className="h-[10rem] w-full rounded-card" />
            </div>
          </div>
          <div className="mt-[2.5rem] flex flex-col gap-8 lg:mt-[5rem]">
            <SectionHeaderSkeleton />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <ReadCardSkeleton key={i} video />
              ))}
            </div>
          </div>
        </div>
      </SkeletonPage>
    </AppLayout>
  );
}
