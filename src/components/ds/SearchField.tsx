import Form from "next/form";
import { SearchLineIcon } from "@/components/icons/mingcute";

// Figma search field (350px, field background). Submits to /search?q=…
export function SearchField({ defaultValue }: { defaultValue?: string }) {
  return (
    <Form action="/search" role="search" className="flex w-full min-w-0 items-center gap-[0.9rem] rounded-card bg-field p-4 lg:w-[35rem]">
      <SearchLineIcon className="shrink-0 text-placeholder" />
      <input
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Rechercher…"
        aria-label="Rechercher un article ou une vidéo"
        className="w-full bg-transparent type-body font-medium text-ink outline-none placeholder:text-placeholder"
      />
    </Form>
  );
}
