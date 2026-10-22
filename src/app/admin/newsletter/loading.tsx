import { Bone, SkeletonPage, TextBone } from "@/components/skeletons/Skeleton";

// Mirrors Newsletter: the five number tiles, the tabs, then newsletter rows.
export default function Loading() {
  return (
    <SkeletonPage label="Chargement de la newsletter">
      <div className="flex flex-col gap-[2.5rem]">
        <div className="-mx-4 flex gap-8 overflow-hidden px-4 md:mx-0 md:grid md:grid-cols-3 md:px-0 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <Bone key={i} className="h-[8.6rem] min-w-[13rem] rounded-card md:min-w-0" />
          ))}
        </div>
        <Bone className="h-[4.1rem] w-[24rem] rounded-[0.75rem]" />
        <div className="flex items-center justify-between">
          <TextBone line="h-[2.03rem]" className="h-[1rem] w-[26rem] max-w-[50%]" />
          <Bone className="h-[4rem] w-[19rem] rounded-card" />
        </div>
        <div className="flex flex-col divide-y divide-canvas">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-6 py-6">
              <div className="flex flex-1 flex-col gap-[0.4rem]">
                <TextBone line="h-[2.32rem]" className="h-[1.2rem] w-1/2" />
                <TextBone line="h-[2.03rem]" className="h-[1rem] w-1/4" />
              </div>
              <Bone className="h-[2.5rem] w-[9rem] rounded-chip" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonPage>
  );
}
