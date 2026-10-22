import { Bone, SkeletonPage, TextBone } from "@/components/skeletons/Skeleton";

// Mirrors Contenus: kind tabs and the filter field, the two featured slots, the status tabs, then rows.
export default function Loading() {
  return (
    <SkeletonPage label="Chargement des contenus">
      <div className="flex flex-col gap-[2.5rem]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <Bone className="h-[4.1rem] w-[22rem] rounded-[0.75rem]" />
          <Bone className="h-[4.1rem] w-[22.5rem] rounded-card lg:h-[5.2rem] lg:w-[35rem]" />
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-[0.4rem]">
            <TextBone line="h-[2.32rem]" className="h-[1.2rem] w-[10rem]" strong />
            <TextBone line="h-[2.03rem]" className="h-[1rem] w-[30rem] max-w-full" />
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Bone className="h-[10.4rem] rounded-panel" />
            <Bone className="h-[10.4rem] rounded-panel" />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <Bone className="h-[4.1rem] w-[40rem] max-w-full rounded-[0.75rem]" />
          <div className="flex flex-col divide-y divide-canvas">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center gap-6 py-6">
                <Bone className="h-[5.6rem] w-[8.4rem] rounded-card" />
                <div className="flex flex-1 flex-col gap-[0.6rem]">
                  <TextBone line="h-[2.32rem]" className="h-[1.2rem] w-2/3" />
                  <TextBone line="h-[2.03rem]" className="h-[1rem] w-1/3" />
                </div>
                <Bone className="hidden size-[4rem] rounded-pill lg:block" />
                <Bone className="hidden h-[4rem] w-[13.5rem] rounded-card lg:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonPage>
  );
}
