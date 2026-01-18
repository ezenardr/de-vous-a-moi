import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

function Button({ className, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "px-12 py-[15px] border-2 border-transparent rounded-[100px] text-center text-white font-medium text-[1.5rem] h-auto leading-5 cursor-pointer transition-all duration-400 flex items-center justify-center",
        className
      )}
    >
      {children}
    </button>
  );
}

export function ButtonPrimary({ children, className, ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      className={cn(
        "cursor-pointer rounded-[5px] bg-[#9FE870] font-secondary text-[16px] font-bold tracking-[-0.48px] text-primary-base leading-[145%] px-[25px] py-[1.2rem] disabled:bg-[#E8E8E8] disabled:text-white  disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </Button>
  );
}
