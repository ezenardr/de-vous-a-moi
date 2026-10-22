import { loadCategory } from "./load";

// Validates the category before loading.tsx streams, so unknown categories get a real 404
// (see app/reads/[slug]/layout.tsx).
export default async function CategoryLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  await loadCategory((await params).slug);
  return children;
}
