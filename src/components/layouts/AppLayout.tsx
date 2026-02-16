import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import MobileTopbar from "./MobileTopbar";

export default function AppLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "bg-[#F9F9F9] px-6 h-dvh flex flex-col lg:grid lg:grid-cols-12 overflow-hidden"
      }
    >
      <Sidebar className={"col-start-1 col-end-3 pr-8 py-10"} />
      <MobileTopbar />
      {/* <main className="flex flex-col h-full flex-1 py-4 overflow-y-auto justify-between lg:col-start-3 lg:col-end-13 "> */}
      <div
        className={cn(
          "bg-white h-full  flex flex-col lg:col-start-3 lg:col-end-13 gap-8 main rounded-2xl overflow-y-hidden p-6 lg:p-4",
          className,
        )}
      >
        {children}
      </div>
      {/* </main> */}
    </div>
  );
}
