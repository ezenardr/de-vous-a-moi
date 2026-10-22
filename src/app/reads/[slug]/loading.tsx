import AppLayout from "@/components/layouts/AppLayout";
import { Bone, SkeletonPage, TextBone } from "@/components/skeletons/Skeleton";

// Mirrors app/reads/[slug]/page.tsx (same wrappers, sizes and spacing) so nothing jumps on load.
export default function Loading() {
  return (
    <AppLayout className="gap-[1.5rem] pt-[1.5rem] lg:gap-0 lg:p-0">
      <SkeletonPage label="Chargement de l'article">
        <div className="-mx-4 -mt-[1.5rem] flex shrink-0 items-center justify-between gap-4 px-4 pt-[1.5rem] pb-4 lg:mx-0 lg:mt-0 lg:h-[8rem] lg:border-b-[1.5px] lg:border-canvas lg:px-8 lg:py-0">
          <Bone className="size-[4rem] rounded-[1rem] lg:hidden" />
          <TextBone line="hidden lg:flex h-[2.4rem]" className="h-[1.6rem] w-[38rem]" strong />
          <Bone className="h-[4rem] w-[11.4rem] rounded-card" />
        </div>
        <div className="flex flex-col lg:px-8 lg:pt-[2.5rem] lg:pb-8">
          <div className="flex flex-col gap-[1.5rem]">
            <Bone className="h-[35rem] w-full rounded-card lg:h-[40rem]" />
            <div className="flex items-center justify-between gap-8">
              <TextBone line="h-[2.4rem] lg:h-[2.88rem]" className="h-[1.6rem] w-3/4 lg:h-[1.9rem] lg:w-[50rem]" strong />
              <Bone className="hidden h-[2rem] w-[9rem] lg:block" />
            </div>
          </div>
          <div className="mt-[3.5rem] flex flex-col gap-[2.5rem] lg:flex-row lg:items-start lg:gap-[3rem]">
            <div className="flex w-full shrink-0 flex-col gap-8 lg:w-[40rem]">
              <TextBone line="h-[2.4rem]" className="h-[1.6rem] w-[20rem]" strong />
              <div className="flex flex-col gap-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <TextBone key={i} line="h-[3.32rem] px-4" className="h-[1.2rem]" />
                ))}
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-[1.5rem]">
              {[4, 3, 5, 2, 4, 3].map((lines, block) => (
                <div key={block} className="flex flex-col">
                  {Array.from({ length: lines }, (_, i) => (
                    <TextBone key={i} line="h-[2.32rem]" className={i === lines - 1 ? "h-[1.2rem] w-2/3" : "h-[1.2rem] w-full"} />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-[3.5rem] flex flex-col gap-[3rem] border-t border-divider pt-[3.5rem] lg:flex-row">
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
        </div>
      </SkeletonPage>
    </AppLayout>
  );
}
