import AppLayout from "@/components/layouts/AppLayout";
import { Bone, SkeletonPage } from "@/components/skeletons/Skeleton";
import { PageHeaderSkeleton } from "@/components/skeletons/ReadSkeletons";

// Mirrors app/categories/(list)/page.tsx: header, then 250px tiles in rows of three.
export default function Loading() {
  return (
    <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
      <SkeletonPage label="Chargement des catégories">
        <PageHeaderSkeleton />
        <div className="lg:px-8 lg:pt-[2.5rem] lg:pb-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="relative h-[25rem]">
                <Bone className="absolute inset-0 rounded-card" />
                <span className="absolute top-[1.75rem] left-[1.75rem] h-[3rem] w-[18rem] rounded-chip bg-white/60" />
                <span className="absolute bottom-[2.75rem] left-[1.75rem] h-[2.5rem] w-[10rem] rounded-chip bg-white/60" />
              </div>
            ))}
          </div>
        </div>
      </SkeletonPage>
    </AppLayout>
  );
}
