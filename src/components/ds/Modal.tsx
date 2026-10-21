"use client";
import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

// Figma "modal" (153:12170, 153:11887): 520px white card, 5px radius, #d1d1d1 border (sides and top),
// 45px x 30px padding, 25px gaps. Bold 28 #0d0d0d title over a #e8e8e8 divider; 18px #767676 text.
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-w-[calc(100%-2rem)] flex-col gap-[2.5rem] rounded-card border-x border-t border-b-0 border-[#d1d1d1] bg-white px-[3rem] py-[4.5rem] shadow-none sm:max-w-[52rem]"
      >
        <div className="flex w-full flex-col gap-4">
          <DialogTitle className="text-[2.8rem] leading-[1.2] font-bold tracking-[-0.084rem] text-black">{title}</DialogTitle>
          <span aria-hidden className="h-px w-full bg-[#e8e8e8]" />
        </div>
        <DialogDescription className="text-[1.8rem] leading-[1.45] tracking-[-0.054rem] text-subtle">{description}</DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
}
