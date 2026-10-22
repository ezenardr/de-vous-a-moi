"use client";
import { CloseLineIcon, SearchLineIcon } from "@/components/icons/mingcute";

// The header search field (same box as SearchField) when it filters the page in place instead of
// going to /search: "Search categories" (153:15201), "Search Saved" (153:15437). A close button
// clears it.
export function FilterField({
  value,
  onChange,
  label,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex w-[22.5rem] min-w-0 items-center gap-[0.9rem] rounded-card bg-field p-4 transition-shadow focus-within:ring-2 focus-within:ring-primary-200 lg:w-[35rem]">
      {!value && <SearchLineIcon className="size-[1.5rem] shrink-0 text-placeholder lg:size-8" />}
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        aria-label={label}
        disabled={disabled}
        className="w-full min-w-0 bg-transparent text-[1.2rem] leading-[1.45] font-medium tracking-[-0.036rem] text-ink outline-none placeholder:text-placeholder lg:type-body lg:font-medium [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button type="button" onClick={() => onChange("")} aria-label="Effacer" className="flex shrink-0 cursor-pointer text-ink">
          <CloseLineIcon className="size-[1.5rem] lg:size-8" />
        </button>
      )}
    </label>
  );
}

// Accent- and case-insensitive match, so "actualites" finds "Actualités".
export const fold = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
