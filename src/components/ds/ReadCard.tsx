import Image from "next/image";
import Link from "next/link";
import { slugify } from "@/lib/Slugify";
import { cn } from "@/lib/utils";
import type { ReadSummary } from "@/server/queries/reads";
import { CoverMeta } from "./CoverMeta";
import { SaveButton } from "./SaveButton";

// Read cards from Figma "Reads" (desktop 153:10581, mobile 153:31942).
// - hero: first featured read. 400px image (350 mobile), black 20% overlay. Author and badges on one
//   pill on desktop, stacked in a 15px-radius block on mobile. Bold title and full description.
// - tall: second featured read. Same height; gradient overlay; stacked block; 2-line description.
// - grid: "Latest reads". 250px image, stacked block, Medium 16 title.
export type ReadCardVariant = "hero" | "tall" | "grid";

// showCategory={false} inside a category page (Figma 153:15026), where the badge would repeat the title.
export function ReadCard({
  read,
  variant = "grid",
  priority,
  showCategory = true,
}: {
  read: ReadSummary;
  variant?: ReadCardVariant;
  priority?: boolean;
  showCategory?: boolean;
}) {
  const featured = variant !== "grid";
  return (
    <Link
      href={`/reads/${slugify(read.title, read.readId)}`}
      className={cn("group flex min-w-0 flex-col", variant === "hero" ? "gap-[0.8rem]" : "gap-4")}
    >
      <div className={cn("relative overflow-hidden rounded-card", featured ? "h-[35rem] lg:h-[40rem]" : "h-[25rem]")}>
        <Image
          src={read.imageUrl}
          alt=""
          fill
          priority={priority}
          // The hero cover is the page's main image (LCP): fetch it first.
          fetchPriority={priority && variant === "hero" ? "high" : undefined}
          sizes={variant === "hero" ? "(min-width: 1024px) 735px, 100vw" : "(min-width: 1024px) 375px, 100vw"}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <div
          aria-hidden
          className={cn("absolute inset-0", variant === "hero" ? "bg-black/20" : "bg-linear-to-b from-black/13 from-[20.916%] to-black/20")}
        />
        <SaveButton id={read.readId} saved={read.isSaved} className="absolute top-4 right-4 z-10" />
        <CoverMeta read={read} layout={variant === "hero" ? "row" : "stack"} showCategory={showCategory} />
      </div>
      {featured ? (
        <div className="flex flex-col gap-[0.5rem]">
          <h3 className="text-[1.8rem] leading-[1.45] font-bold tracking-[-0.054rem] text-ink lg:type-title lg:font-bold">{read.title}</h3>
          <p className={cn("type-body text-faint lg:max-w-[60rem]", variant === "tall" && "line-clamp-2")}>{read.description}</p>
        </div>
      ) : (
        <h3 className="type-body-lg font-medium text-ink">{read.title}</h3>
      )}
    </Link>
  );
}
