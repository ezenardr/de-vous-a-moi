import { cn } from "@/lib/utils";
import MobileTopbar from "./MobileTopbar";
import Sidebar from "./Sidebar";

// Figma frame: nav on the canvas, content in a white panel inset by 10px with 10px corners.
export default function AppLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas lg:flex-row">
      <Sidebar />
      <MobileTopbar />
      <main
        className={cn(
          "mx-[0.5rem] mb-[0.5rem] flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto rounded-panel bg-white p-4 lg:m-4 lg:ml-0 lg:p-8",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}
