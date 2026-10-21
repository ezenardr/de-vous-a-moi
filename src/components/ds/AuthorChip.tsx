import Image from "next/image";
import { User4FillIcon } from "@/components/icons/mingcute";

type Author = { firstName: string; lastName: string; profileImageUrl: string | null | undefined };

// 25px avatar with the lime ring from Figma, followed by the author's name in white.
export function AuthorChip({ author }: { author: Author }) {
  const name = `${author.firstName} ${author.lastName}`.trim();
  return (
    <span className="flex min-w-0 items-center gap-[0.5rem]">
      <span className="flex size-[2.5rem] shrink-0 items-center justify-center rounded-pill border border-secondary-base p-px">
        <span className="relative size-full overflow-hidden rounded-pill border border-white bg-white">
          {author.profileImageUrl ? (
            <Image src={author.profileImageUrl} alt="" fill sizes="25px" className="object-cover" />
          ) : (
            <User4FillIcon size={21} className="text-faint" />
          )}
        </span>
      </span>
      <span className="truncate type-body font-medium text-white">{name}</span>
    </span>
  );
}
