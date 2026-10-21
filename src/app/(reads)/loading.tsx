import AppLayout from "@/components/layouts/AppLayout";
import { SkeletonPage } from "@/components/skeletons/Skeleton";
import { PageHeaderSkeleton, ReadCardSkeleton, SectionHeaderSkeleton } from "@/components/skeletons/ReadSkeletons";

// Mirrors app/(reads)/page.tsx exactly (same wrappers and spacing), so nothing shifts on load.
export default function Loading() {
  return (
    <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
      <SkeletonPage label="Chargement des lectures">
        <PageHeaderSkeleton />
        <div className="flex flex-col gap-8 pt-8 lg:gap-[2.5rem] lg:px-8 lg:pt-[2.5rem] lg:pb-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,73.5fr)_minmax(0,37.5fr)] lg:items-start">
            <ReadCardSkeleton variant="hero" />
            <ReadCardSkeleton variant="tall" />
          </div>
          <div className="flex flex-col gap-8">
            <SectionHeaderSkeleton />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <ReadCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </SkeletonPage>
    </AppLayout>
  );
}
