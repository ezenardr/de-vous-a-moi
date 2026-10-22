import { Bone, SkeletonPage, TextBone } from "@/components/skeletons/Skeleton";

// Mirrors Utilisateurs: role tabs and the filter field, then account rows.
export default function Loading() {
  return (
    <SkeletonPage label="Chargement des utilisateurs">
      <div className="flex flex-col gap-[2.5rem]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <Bone className="h-[4.1rem] w-[46rem] max-w-full rounded-[0.75rem]" />
          <Bone className="h-[4.1rem] w-[22.5rem] rounded-card lg:h-[5.2rem] lg:w-[35rem]" />
        </div>
        <div className="flex flex-col divide-y divide-canvas">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex items-center gap-6 py-6">
              <div className="flex flex-1 flex-col gap-[0.4rem]">
                <div className="flex items-center gap-[0.5rem]">
                  <Bone className="size-[3rem] rounded-pill" />
                  <TextBone line="h-[2.32rem]" className="h-[1.2rem] w-[14rem]" />
                </div>
                <TextBone line="h-[2.03rem]" className="ml-[3.5rem] h-[1rem] w-[26rem] max-w-[70%]" />
              </div>
              <Bone className="hidden h-[2.5rem] w-[9rem] rounded-chip lg:block" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonPage>
  );
}
