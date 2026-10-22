import Link from "next/link";
import { ExternalLinkFillIcon, Link2FillIcon } from "@/components/icons/mingcute";
import { slugify } from "@/lib/Slugify";

// Figma "Related Reads" (153:12799): Bold 16 title, then #f8f8f8 rows (35px radius, 10px padding):
// a #163300 circle with a white 10px link icon, the underlined title, a #163300 external-link icon.
export function RelatedReads({ related }: { related: { readId: string; title: string }[] }) {
  if (related.length === 0) return null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="type-body-lg font-bold text-black">Lectures associées</h2>
      <ul className="flex flex-col gap-4">
        {related.map((read) => (
          <li key={read.readId}>
            <Link
              href={`/reads/${slugify(read.title, read.readId)}`}
              className="group flex items-center gap-8 rounded-[3.5rem] bg-field p-4 transition-colors hover:bg-[#f1f1f1]"
            >
              <span className="flex min-w-0 flex-1 items-center gap-4">
                <span className="flex shrink-0 rounded-[2rem] bg-primary-base p-[0.5rem] text-white">
                  <Link2FillIcon size={10} />
                </span>
                <span className="truncate type-body-lg text-black underline underline-offset-[0.2em]">{read.title}</span>
              </span>
              <ExternalLinkFillIcon className="shrink-0 text-primary-base transition-transform duration-300 group-hover:translate-x-[0.2rem] group-hover:-translate-y-[0.2rem]" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
