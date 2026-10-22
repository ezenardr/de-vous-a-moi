import { cn } from "@/lib/utils";
import type { ComponentType, ReactNode } from "react";

// Figma "Badge": #f8fafc chip, 5px padding (10px on the right), 15px icon, 12px bold uppercase label.
// The icon is #334155 by default; category badges colour icon and label together.
export function Badge({
  icon: Icon,
  children,
  className,
  iconClassName = "text-badge-icon",
}: {
  icon?: ComponentType<{ size?: number; className?: string }>;
  children: ReactNode;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-[0.5rem] rounded-chip bg-chip py-[0.5rem] pr-4 pl-[0.5rem] type-badge whitespace-nowrap text-ink",
        className,
      )}
    >
      {Icon && <Icon size={15} className={cn("shrink-0", iconClassName)} />}
      {children}
    </span>
  );
}
