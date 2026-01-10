import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import AuthProvider from "@/lib/AuthProvider";

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
  title: "De vous à moi",
  description:
    "Nous mettons en avant un contenu pertinent qui informe, explique et enrichit. Nous valorisons l’authenticité et la créativité. Nous prônons l’interaction et la communauté, en allant à la rencontre des autres.",
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
          <Toaster position="top-right" richColors />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
