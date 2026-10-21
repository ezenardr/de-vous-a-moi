import { cn } from "@/lib/utils";
import type { ComponentType, ReactNode } from "react";

// Figma "Badge": chip background, 15px icon, 12px bold uppercase label.
export function Badge({
  icon: Icon,
  children,
  className,
}: {
  icon?: ComponentType<{ size?: number; className?: string }>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-[0.5rem] rounded-chip bg-chip py-[0.5rem] pr-4 pl-[0.5rem] type-badge whitespace-nowrap text-ink",
        className,
      )}
    >
      {Icon && <Icon size={15} className="shrink-0" />}
      {children}
    </span>
  );
}
