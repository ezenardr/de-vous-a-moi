import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import bg from "@/assets/auth/auth-bg.jpg";
import { BrandLogo } from "@/components/ds/BrandLogo";
import { cn } from "@/lib/utils";

// Links in auth emails carry tokens: never leak them through the Referer header. Not for search engines.
export const metadata: Metadata = {
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="De vous à moi, accueil" className={cn("flex items-center p-4", className)}>
      <BrandLogo />
    </Link>
  );
}

// Figma auth frames (e.g. Sign in 153:17553): logo row (25px from the edges), then a 1390 x 929
// background with a 16px radius and a 15% dark overlay, the white card centred on it and the step
// badge in its top-right corner. Mobile (153:30279): the background fills the screen, the white logo
// sits at 45px and the card is a sheet from 114px down.
// Server-rendered: only the forms themselves are client components.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-white lg:px-[2.5rem] lg:pt-[2.5rem] lg:pb-[2.5rem]">
      <Logo className="hidden h-[4.4rem] self-start text-primary-base lg:flex" />
      <main className="relative flex flex-1 flex-col lg:mt-[0.1rem] lg:items-center lg:justify-center lg:overflow-hidden lg:rounded-[1.6rem] lg:py-[8rem]">
        <Image src={bg} alt="" fill priority placeholder="blur" sizes="(min-width: 1024px) 1390px, 100vw" className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-[rgb(4_5_4/0.15)]" />
        <Logo className="absolute top-[4.5rem] left-[1.5rem] z-10 text-white lg:hidden" />
        {children}
      </main>
    </div>
  );
}
