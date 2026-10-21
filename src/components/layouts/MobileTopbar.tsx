"use client";
import { useState } from "react";
import { CloseLineIcon, MenuLineIcon } from "@/components/icons/mingcute";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import NavContent, { Logo } from "./NavContent";

// Figma mobile header (logo and menu button) and "Navs" bottom sheet.
export default function MobileTopbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="flex items-center justify-between px-4 pt-12 pb-4 lg:hidden">
      <Logo />
      <Drawer direction="bottom" open={open} onOpenChange={setOpen}>
        <DrawerTrigger aria-label="Ouvrir le menu" className="flex size-[4rem] items-center justify-center rounded-card bg-white text-ink">
          <MenuLineIcon size={24} />
        </DrawerTrigger>
        <DrawerContent className="h-[90dvh] rounded-t-[2rem] bg-canvas">
          <DrawerTitle className="sr-only">Menu</DrawerTitle>
          <DrawerDescription className="sr-only">Navigation du site</DrawerDescription>
          <div className="flex h-full flex-col gap-8 overflow-y-auto px-6 pt-6 pb-10">
            <DrawerClose aria-label="Fermer le menu" className="flex size-[4rem] items-center justify-center self-end rounded-card bg-white text-ink">
              <CloseLineIcon size={24} />
            </DrawerClose>
            <NavContent variant="mobile" onNavigate={close} />
          </div>
        </DrawerContent>
      </Drawer>
    </header>
  );
}
