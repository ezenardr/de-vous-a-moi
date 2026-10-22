import { Bone, SkeletonPage, TextBone } from "@/components/skeletons/Skeleton";

// Mirrors the overview under the admin header and section links (they stay rendered by the layout):
// the five number tiles, then four bordered panels of five rows.
export default function Loading() {
  return (
    <SkeletonPage label="Chargement de l'administration">
      <div className="-mx-4 flex gap-8 overflow-hidden px-4 md:mx-0 md:grid md:grid-cols-3 md:px-0 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Bone key={i} className="h-[10.4rem] min-w-[13rem] rounded-card md:min-w-0" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, panel) => (
          <div key={panel} className="flex flex-col gap-6 rounded-panel border-[1.5px] border-canvas p-8">
            <TextBone line="h-[2.32rem]" className="h-[1.2rem] w-[14rem]" strong />
            <div className="flex flex-col divide-y divide-canvas">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center gap-4 py-[1.2rem] first:pt-0 last:pb-0">
                  <Bone className="h-[4.4rem] w-[6.6rem] rounded-card" />
                  <div className="flex flex-1 flex-col gap-[0.6rem]">
                    <TextBone line="h-[2.03rem]" className="h-[1rem] w-3/4" />
                    <TextBone line="h-[2.03rem]" className="h-[1rem] w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SkeletonPage>
  );
}
