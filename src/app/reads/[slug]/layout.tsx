import { loadArticle } from "./load";

// Validates the article before loading.tsx starts streaming, so unknown articles get a real 404
// and outdated slugs a real 308 (a check inside the page would run after the skeleton was sent with 200).
export default async function ArticleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  await loadArticle((await params).slug);
  return children;
}
