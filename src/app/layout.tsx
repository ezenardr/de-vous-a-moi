import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import AuthProvider from "@/lib/AuthProvider";
import MotionProvider from "@/components/motion/MotionProvider";
import { Analytics } from "@vercel/analytics/next";
import TopLoader from "@/components/shared/TopLoader";
import { SITE, baseOpenGraph } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-primary",
  subsets: ["latin"],
});

const satoshi = localFont({
  src: [
    { path: "../fonts/satoshi/Satoshi-Regular.otf", weight: "400" },
    { path: "../fonts/satoshi/Satoshi-Medium.otf", weight: "500" },
    { path: "../fonts/satoshi/Satoshi-Bold.otf", weight: "700" },
    { path: "../fonts/satoshi/Satoshi-Black.otf", weight: "900" },
  ],
  variable: "--font-secondary",
});

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_APP_URL!,
  // Pages give a short title ("Vidéos"); the template adds the site name.
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  applicationName: SITE.name,
  authors: [{ name: SITE.editor }],
  // Share images come from app/opengraph-image.jpg (and the per-article opengraph-image.tsx).
  openGraph: { ...baseOpenGraph, type: "website" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  description: SITE.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${satoshi.variable} font-secondary bg-[#F9F9F9] antialiased`}
      >
        <AuthProvider>
          <TopLoader />
          <Toaster position="top-right" richColors />
          <MotionProvider>{children}</MotionProvider>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
