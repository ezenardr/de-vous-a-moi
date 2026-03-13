import { cn } from "@/lib/utils";

interface DivProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isValid?: boolean;
  className?: string;
}

export function Criteria({ className, children, isValid, ...props }: DivProps) {
  return (
    <div
      {...props}
      className={cn(
        "px-[0.8rem] py-[0.4rem] rounded-[2rem] border-2 border-transparent text-center font-primary text-[12px] leading-[145%] tracking-[-3%] cursor-pointer transition-all duration-400 flex items-center justify-center",
        isValid ? "bg-[#EDF6EC] text-[#349C2E]" : "bg-[#F8F8F8] text-[#A3A3A3]",
        className,
      )}
    >
      {children}
    </div>
  );
}
