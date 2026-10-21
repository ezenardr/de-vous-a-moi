"use client";
import { motion } from "motion/react";
import { useState } from "react";
import { CloseLineIcon, MenuFillIcon } from "@/components/icons/mingcute";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import NavContent, { Logo } from "./NavContent";

// Figma mobile header (153:32649): 15px side margins, logo, and a white 10px-radius menu button
// with the 20px menu-fill icon. The menu opens the "Navs" bottom sheet (155:33498).
// Figma places it 45px down to clear the phone status bar; in a browser that space is the
// browser's own chrome, so only the safe-area inset is kept.
export default function MobileTopbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="flex items-center justify-between px-[1.5rem] pt-[max(env(safe-area-inset-top),0.5rem)] pb-[0.5rem] lg:hidden">
      <Logo />
      <Drawer direction="bottom" open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <motion.button
            type="button"
            aria-label="Ouvrir le menu"
            whileTap={{ scale: 0.92 }}
            className="flex items-center rounded-[1rem] bg-white p-4 text-ink backdrop-blur-[5px]"
          >
            <MenuFillIcon />
          </motion.button>
        </DrawerTrigger>
        <DrawerContent showHandle={false} className="h-[90dvh] rounded-t-[2rem] bg-canvas">
          <DrawerTitle className="sr-only">Menu</DrawerTitle>
          <DrawerDescription className="sr-only">Navigation du site</DrawerDescription>
          <div className="flex h-full flex-col gap-8 overflow-y-auto px-[1.5rem] pt-6 pb-10">
            <DrawerClose aria-label="Fermer le menu" className="flex items-center self-end rounded-[1rem] bg-white p-4 text-ink">
              <CloseLineIcon />
            </DrawerClose>
            <NavContent variant="mobile" onNavigate={close} />
          </div>
        </DrawerContent>
      </Drawer>
    </header>
  );
}
