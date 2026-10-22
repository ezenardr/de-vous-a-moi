"use client";
import type { ReactNode } from "react";
import { CloseFillIcon } from "@/components/icons/mingcute";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { NewsletterBand } from "./NewsletterBand";

// Figma "modal" (153:12170, 153:11887, 153:16245, 153:17034): white card, #d1d1d1 border (sides and
// top), 25px gaps. Bold 28 #0d0d0d title over a #e8e8e8 divider; 18px #767676 text. Overlay #090909 at 70%.
// size "md": 520px, 5px radius, 45 x 30px padding. size "lg" (Account): 650px, 10px radius, 30px padding.
// banner: the newsletter's lime strip of books on top (content starts 134px down).
// Mobile (156:52706): a bottom sheet, 20px top corners, 15px sides, Bold 24 title, a close button.
// hideHeader: the title stays for screen readers only (success screens).
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
  banner = false,
  hideHeader = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  size?: "md" | "lg";
  banner?: boolean;
  hideHeader?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-[rgb(9_9_9/0.7)]"
        {...(description ? {} : { "aria-describedby": undefined })}
        className={cn(
          "flex flex-col gap-[2.5rem] overflow-hidden border-x border-t border-b-0 border-[#d1d1d1] bg-white shadow-none",
          // Mobile: bottom sheet sliding up.
          "max-lg:top-auto max-lg:bottom-0 max-lg:left-0 max-lg:max-h-[95dvh] max-lg:w-full max-lg:max-w-none max-lg:translate-x-0 max-lg:translate-y-0 max-lg:overflow-y-auto max-lg:rounded-t-[2rem] max-lg:rounded-b-none max-lg:px-[1.5rem] max-lg:pb-[3rem] max-lg:data-[state=closed]:slide-out-to-bottom max-lg:data-[state=closed]:zoom-out-100 max-lg:data-[state=open]:slide-in-from-bottom max-lg:data-[state=open]:zoom-in-100",
          banner ? "max-lg:pt-[13.4rem]" : "max-lg:pt-[10rem]",
          size === "md"
            ? cn("lg:max-w-[52rem] lg:rounded-card lg:px-[3rem] lg:pb-[4.5rem]", banner ? "lg:pt-[13.4rem]" : "lg:pt-[4.5rem]")
            : "lg:max-h-[90dvh] lg:max-w-[65rem] lg:overflow-y-auto lg:rounded-panel lg:p-[3rem]",
        )}
      >
        {banner && <NewsletterBand />}
        <DialogClose
          aria-label="Fermer"
          className={cn(
            "absolute right-[1.5rem] z-10 flex cursor-pointer items-center rounded-panel bg-field p-4 text-ink backdrop-blur-[5px] lg:hidden",
            banner ? "top-[7rem]" : "top-[3rem]",
          )}
        >
          <CloseFillIcon />
        </DialogClose>
        <div className={cn("relative flex w-full flex-col gap-4", hideHeader && "sr-only")}>
          <DialogTitle className="text-[2.4rem] leading-[1.2] font-bold tracking-[-0.072rem] text-black lg:text-[2.8rem] lg:tracking-[-0.084rem]">
            {title}
          </DialogTitle>
          <span aria-hidden className="h-px w-full bg-[#e8e8e8]" />
        </div>
        {description && (
          <DialogDescription className={cn("relative text-[1.8rem] leading-[1.45] tracking-[-0.054rem] text-subtle", hideHeader && "sr-only")}>
            {description}
          </DialogDescription>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}

// Figma modal footer: "Go back" (#f8f8f8, Bold 16 #333, fills the row) and the 320px primary button.
// Mobile: the primary button on top, both full width.
export function ModalActions({ children }: { children: ReactNode }) {
  return <div className="relative flex flex-col-reverse gap-8 lg:flex-row lg:items-stretch">{children}</div>;
}

export function ModalBackButton({ children = "Retour" }: { children?: ReactNode }) {
  return (
    <DialogClose className="flex h-[5.2rem] cursor-pointer items-center justify-center rounded-card bg-field p-4 type-body-lg font-bold text-ink transition-colors hover:bg-[#f1f1f1] lg:flex-1">
      {children}
    </DialogClose>
  );
}
