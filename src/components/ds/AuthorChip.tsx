import Image from "next/image";
import { User4FillIcon } from "@/components/icons/mingcute";
import { cn } from "@/lib/utils";

type Author = { firstName: string; lastName: string; profileImageUrl: string | null | undefined };

// 25px avatar with the lime ring from Figma, followed by the author's name in white.
// variant="page": 30px avatar and a Medium 16 #333 name, under the video title (Figma 153:14813).
export function AuthorChip({ author, variant = "cover" }: { author: Author; variant?: "cover" | "page" }) {
  const name = `${author.firstName} ${author.lastName}`.trim();
  const page = variant === "page";
  return (
    <span className="flex min-w-0 items-center gap-[0.5rem]">
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-pill border border-secondary-base p-px",
          page ? "size-[3rem]" : "size-[2.5rem]",
        )}
      >
        <span className="relative size-full overflow-hidden rounded-pill border border-white bg-white">
          {author.profileImageUrl ? (
            <Image src={author.profileImageUrl} alt="" fill sizes={page ? "30px" : "25px"} className="object-cover" />
          ) : (
            <User4FillIcon size={page ? 26 : 21} className="text-faint" />
          )}
        </span>
      </span>
      <span className={cn("truncate font-medium", page ? "type-body-lg text-ink" : "type-body text-white")}>{name}</span>
    </span>
  );
}
