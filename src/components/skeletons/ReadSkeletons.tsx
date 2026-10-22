import { cn } from "@/lib/utils";
import type { ReadCardVariant } from "@/components/ds/ReadCard";
import { Bone, TextBone } from "./Skeleton";

// Mirrors components/ds/PageHeader + SearchField.
export function PageHeaderSkeleton() {
  return (
    <div className="flex shrink-0 items-center justify-between gap-4 border-canvas lg:h-[8rem] lg:border-b-[1.5px] lg:px-8">
      <TextBone line="h-[2.4rem]" className="h-[1.6rem] w-[9rem]" strong />
      <Bone className="h-[3.7rem] w-[22.5rem] rounded-card lg:h-[4.03rem] lg:w-[35rem]" />
    </div>
  );
}

// Mirrors components/ds/ReadCard, box for box. video: components/ds/VideoCard (play pill, no description).
export function ReadCardSkeleton({
  variant = "grid",
  video = false,
  showCategory = true,
}: {
  variant?: ReadCardVariant;
  video?: boolean;
  showCategory?: boolean;
}) {
  const featured = variant !== "grid";
  return (
    <div className={cn("flex min-w-0 flex-col", variant === "hero" ? "gap-[0.8rem]" : "gap-4")}>
      <div className={cn("relative overflow-hidden rounded-card", featured ? "h-[35rem] lg:h-[40rem]" : "h-[25rem]")}>
        <Bone className="absolute inset-0 rounded-card" />
        <span className="absolute top-4 right-4 size-[4rem] rounded-pill bg-white/60" />
        {video && variant === "hero" && (
          <span className="absolute top-1/2 left-1/2 h-[3rem] w-[12rem] -translate-x-1/2 -translate-y-1/2 rounded-pill bg-white/55" />
        )}
        <div
          className={cn(
            "absolute inset-x-4 bottom-4 flex flex-col gap-4 rounded-glass bg-white/55 p-[0.5rem]",
            variant === "hero" && "lg:flex-row lg:items-center lg:justify-between lg:rounded-pill",
          )}
        >
          <span className="flex items-center gap-[0.5rem]">
            <span className="size-[2.5rem] rounded-pill bg-white" />
            <span className="h-[1.2rem] w-[11rem] rounded-chip bg-white" />
          </span>
          <span className="flex gap-[0.5rem]">
            <span className="h-[2.5rem] w-[11rem] rounded-chip bg-white" />
            <span className="h-[2.5rem] w-[7rem] rounded-chip bg-white" />
            {showCategory && <span className="h-[2.5rem] w-[11rem] rounded-chip bg-white" />}
          </span>
        </div>
      </div>
      {featured ? (
        <div className="flex flex-col gap-[0.5rem]">
          <TextBone line="h-[2.61rem] lg:h-[2.4rem]" className="h-[1.5rem] w-3/4" strong />
          {!video && (
            <>
              <TextBone line="h-[2.03rem]" className="h-[1.1rem] w-full lg:max-w-[60rem]" />
              <TextBone line="h-[2.03rem]" className="h-[1.1rem] w-2/3" />
            </>
          )}
        </div>
      ) : (
        <TextBone line="h-[2.32rem]" className="h-[1.3rem] w-4/5" strong />
      )}
    </div>
  );
}

export function SectionHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4">
      <TextBone line="h-[2.4rem] lg:h-[2.88rem]" className="h-[1.6rem] w-[16rem] lg:h-[1.9rem]" strong />
      <TextBone line="h-[2.32rem]" className="h-[1.3rem] w-[8rem]" />
    </div>
  );
}
