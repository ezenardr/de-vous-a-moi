import type { Metadata } from "next";

// The author studio is private: never indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
