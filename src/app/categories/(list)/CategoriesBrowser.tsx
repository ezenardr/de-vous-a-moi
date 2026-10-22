"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { CategoryTile } from "@/components/ds/CategoryTile";
import { EmptyState } from "@/components/ds/EmptyState";
import { PageHeader } from "@/components/ds/PageHeader";
import { FilterField, fold } from "@/components/ds/FilterField";
import { Folder3FillIcon } from "@/components/icons/mingcute";
import { EASE_OUT } from "@/components/motion/easing";

// Figma "Categories" (153:14934) and "Categories - search" (153:15201): the header field filters the
// tiles as you type (accent-insensitive); a close button clears it.
export function CategoriesBrowser({ categories }: { categories: { category: string; total: number }[] }) {
  const [query, setQuery] = useState("");
  const shown = categories.filter(({ category }) => fold(category).includes(fold(query.trim())));

  return (
    <>
      <PageHeader title={<h1>Catégories</h1>} search={false}>
        <FilterField value={query} onChange={setQuery} label="Rechercher une catégorie" />
      </PageHeader>
      <div className="lg:px-8 lg:pt-[2.5rem] lg:pb-8">
        {shown.length === 0 ? (
          <EmptyState icon={Folder3FillIcon}>
            {categories.length === 0 ? "Aucune catégorie pour le moment." : `Aucune catégorie ne correspond à « ${query.trim()} ».`}
          </EmptyState>
        ) : (
          <motion.ul layout className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false} mode="popLayout">
              {shown.map(({ category, total }, i) => (
                <motion.li
                  key={category}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT, delay: query ? 0 : i * 0.06 } }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                >
                  <CategoryTile category={category} total={total} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>
    </>
  );
}
