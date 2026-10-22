export const dynamic = "force-dynamic";

import AppLayout from "@/components/layouts/AppLayout";
import { getCategoriesCached } from "@/server/queries/reads";
import { CategoriesBrowser } from "./CategoriesBrowser";

export const metadata = {
  title: "Catégories",
  description: "Explorez De vous à moi par thème : Actualités, Style de vie, Le Spotlight et Technologies.",
  alternates: { canonical: "/categories" },
};

// Figma "Categories": desktop 153:14934 (search 153:15201), mobile 156:47420 (search 156:48652).
// 25px under the header, tiles of 363 x 250 in rows of three with 20px gaps; one column on mobile.
export default async function CategoriesPage() {
  const categories = await getCategoriesCached();
  return (
    <AppLayout className="pt-[1.5rem] lg:gap-0 lg:p-0">
      <CategoriesBrowser categories={categories} />
    </AppLayout>
  );
}
