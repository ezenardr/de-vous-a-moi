import Form from "next/form";
import { SearchLineIcon } from "@/components/icons/mingcute";

// Figma search field: #f8f8f8, 10px padding, 5px radius, 9px gap.
// Mobile: 225px wide, 15px icon, Medium 12. Desktop: 350px, 20px icon, Medium 14. Submits to /search?q=…
export function SearchField({ defaultValue }: { defaultValue?: string }) {
  return (
    <Form
      action="/search"
      role="search"
      className="flex w-[22.5rem] min-w-0 items-center gap-[0.9rem] rounded-card bg-field p-4 transition-shadow focus-within:ring-2 focus-within:ring-primary-200 lg:w-[35rem]"
    >
      <SearchLineIcon className="size-[1.5rem] shrink-0 text-placeholder lg:size-8" />
      <input
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Rechercher…"
        aria-label="Rechercher un article ou une vidéo"
        className="w-full min-w-0 bg-transparent text-[1.2rem] leading-[1.45] font-medium tracking-[-0.036rem] text-ink outline-none placeholder:text-placeholder lg:type-body lg:font-medium"
      />
    </Form>
  );
}
