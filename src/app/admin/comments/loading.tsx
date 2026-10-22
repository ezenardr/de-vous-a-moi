import { Bone, SkeletonPage, TextBone } from "@/components/skeletons/Skeleton";

// Mirrors Commentaires: status tabs and the filter field, then comment rows.
export default function Loading() {
  return (
    <SkeletonPage label="Chargement des commentaires">
      <div className="flex flex-col gap-[2.5rem]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <Bone className="h-[4.1rem] w-[31rem] max-w-full rounded-[0.75rem]" />
          <Bone className="h-[4.1rem] w-[22.5rem] rounded-card lg:h-[5.2rem] lg:w-[35rem]" />
        </div>
        <div className="flex flex-col divide-y divide-canvas">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex flex-col gap-4 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[0.5rem]">
                  <Bone className="size-[3rem] rounded-pill" />
                  <TextBone line="h-[2.32rem]" className="h-[1.2rem] w-[12rem]" />
                </div>
                <TextBone line="h-[2.03rem]" className="h-[1rem] w-[6rem]" />
              </div>
              <div className="ml-[3.5rem] flex flex-col gap-4">
                <Bone className="h-[6rem] rounded-card" />
                <TextBone line="h-[2.03rem]" className="h-[1rem] w-[24rem] max-w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SkeletonPage>
  );
}
