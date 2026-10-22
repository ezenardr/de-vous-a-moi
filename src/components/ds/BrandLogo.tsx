import Image from "next/image";
import logo from "@/assets/logos/logo-mark.webp";
import { cn } from "@/lib/utils";

// The blog's own mark (feather over the green circle), not the Figma placeholder book icon, followed by
// the "De vous à moi" wordmark (Bold 20). The text colour comes from the parent (green, or white on photos).
// The mark is a pre-sized 2x WebP (106 x 72, ~4 KB, made from logos/logo.png), served as is; it is not
// preloaded, so the page's main image keeps the browser's attention.
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-[0.6rem]", className)}>
      <Image src={logo} alt="" unoptimized className="h-[3.6rem] w-auto shrink-0" />
      <span className="type-title font-bold whitespace-nowrap">De vous à moi</span>
    </span>
  );
}
