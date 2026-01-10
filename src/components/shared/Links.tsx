import { cn } from "@/lib/utils";
import Link from "next/link";

interface LinkButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  className?: string;
  href: string;
}

function LinkButton({ className, children, href, ...props }: LinkButtonProps) {
  return (
    <Link
      href={href}
      {...props}
      className={cn(
        "px-12 py-[7px] border-2 border-transparent rounded-[100px] text-center text-white font-medium text-[1.5rem] h-auto leading-5 cursor-pointer transition-all duration-400 flex items-center justify-center",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function LinkButtonPrimary({
  children,
  className,
  href,
  ...props
}: LinkButtonProps) {
  return (
    <LinkButton
      href={href}
      {...props}
      className={cn(
        "w-full cursor-pointer rounded-[5px] bg-[#9FE870] font-secondary text-[16px] font-bold tracking-[-0.48px] text-primary-base leading-[145%]",
        className
      )}
    >
      {children}
    </LinkButton>
  );
}
