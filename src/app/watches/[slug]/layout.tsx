import { loadWatch } from "./load";

// Validates the video before loading.tsx starts streaming, so unknown videos get a real 404
// and outdated slugs a real 308 (see app/reads/[slug]/layout.tsx).
export default async function WatchLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  await loadWatch((await params).slug);
  return children;
}
