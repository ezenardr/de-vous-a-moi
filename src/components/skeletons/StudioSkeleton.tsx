import AppLayout from "@/components/layouts/AppLayout";
import { Bone, SkeletonPage, TextBone } from "./Skeleton";
import { ReadCardSkeleton } from "./ReadSkeletons";

// Mirrors the studio lists (Mes articles / Mes vidéos): header with the action button, the five
// number tiles, the tabs, then cards in rows of three.
export function StudioListSkeleton({ label, tabs }: { label: string; tabs: number }) {
  return (
    <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
      <SkeletonPage label={label}>
        <div className="flex shrink-0 items-center justify-between gap-4 border-canvas lg:h-[8rem] lg:border-b-[1.5px] lg:px-8">
          <TextBone line="h-[2.4rem]" className="h-[1.6rem] w-[14rem]" strong />
          <Bone className="h-[4rem] w-[15rem] rounded-card" />
        </div>
        <div className="flex flex-col gap-[3rem] lg:gap-[2.5rem] lg:px-8 lg:pt-[2.5rem] lg:pb-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }, (_, i) => (
              <Bone key={i} className="h-[8.6rem] rounded-card" />
            ))}
          </div>
          <div className="flex flex-col gap-8">
            <Bone className={tabs === 3 ? "h-[4.1rem] w-[33rem] rounded-[0.75rem]" : "h-[4.1rem] w-[22rem] rounded-[0.75rem]"} />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <ReadCardSkeleton key={i} video showCategory={false} />
              ))}
            </div>
          </div>
        </div>
      </SkeletonPage>
    </AppLayout>
  );
}
