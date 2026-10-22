import AppLayout from "@/components/layouts/AppLayout";
import { Bone, SkeletonPage, TextBone } from "@/components/skeletons/Skeleton";
import { ReadCardSkeleton, SectionHeaderSkeleton } from "@/components/skeletons/ReadSkeletons";

// Mirrors app/about/page.tsx: header with the share button, the letter | portrait row, numbers,
// category tiles and the latest reads.
export default function Loading() {
  return (
    <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
      <SkeletonPage label="Chargement de la page À propos">
        <div className="flex shrink-0 items-center justify-between gap-4 border-canvas lg:h-[8rem] lg:border-b-[1.5px] lg:px-8">
          <TextBone line="h-[2.4rem]" className="h-[1.6rem] w-[10rem]" strong />
          <Bone className="h-[4rem] w-[11.4rem] rounded-card" />
        </div>
        <div className="flex flex-col gap-[3rem] lg:gap-[5rem] lg:px-8 lg:pt-[2.5rem] lg:pb-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,73.5fr)_minmax(0,37.5fr)] lg:items-start">
            <div className="order-2 flex flex-col gap-[2.5rem] lg:order-1">
              <div className="flex flex-col gap-[1.5rem]">
                <TextBone line="h-[2.61rem] lg:h-[2.88rem]" className="h-[1.5rem] w-full lg:h-[1.9rem]" strong />
                <TextBone line="h-[2.61rem] lg:h-[2.88rem]" className="h-[1.5rem] w-2/3 lg:h-[1.9rem]" strong />
                {[0, 1, 2].map((i) => (
                  <TextBone key={i} line="h-[2.32rem]" className={i === 2 ? "h-[1.3rem] w-1/2" : "h-[1.3rem] w-full"} />
                ))}
              </div>
              <div className="flex flex-col gap-[1.5rem] border-t border-divider pt-[2.5rem]">
                {[3, 4, 4, 2].map((lines, p) => (
                  <div key={p} className="flex flex-col">
                    {Array.from({ length: lines }, (_, i) => (
                      <TextBone key={i} line="h-[2.32rem]" className={i === lines - 1 ? "h-[1.3rem] w-2/3" : "h-[1.3rem] w-full"} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <Bone className="order-1 h-[42rem] w-full rounded-card lg:order-2 lg:h-[50rem]" />
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Bone key={i} className="h-[10.5rem] rounded-card" />
            ))}
          </div>
          <div className="flex flex-col gap-8">
            <SectionHeaderSkeleton />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <Bone key={i} className="h-[25rem] rounded-card" />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-8">
            <SectionHeaderSkeleton />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <ReadCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </SkeletonPage>
    </AppLayout>
  );
}
