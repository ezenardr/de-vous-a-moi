import NavContent, { Logo } from "./NavContent";

// Figma "Nav" (desktop): 260px column on the canvas background.
export default function Sidebar() {
  return (
    <aside className="hidden h-dvh w-[26rem] shrink-0 flex-col gap-12 overflow-y-auto px-6 pt-10 pb-10 lg:flex">
      <Logo />
      <NavContent variant="desktop" />
    </aside>
  );
}
