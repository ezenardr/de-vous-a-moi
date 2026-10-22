import { loadStudioRead } from "./load";

// Validates before any loading UI streams, so an unknown or someone else's read is a real 404.
export default async function StudioReadLayout({ children, params }: { children: React.ReactNode; params: Promise<{ readId: string }> }) {
  await loadStudioRead((await params).readId);
  return children;
}
