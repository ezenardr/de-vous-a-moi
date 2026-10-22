import Link from "next/link";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Figma "Button / primary": #9fe870, 5px radius, #163300 icon and Bold label.
// size "md": 10x15 padding, 20px icon, 14px label. size "lg": 52px tall, 15x25 padding, 24px icon, 16px label.
// Secondary ("Go back"): #f8f8f8, 10px padding, Bold 16 #333.
type Variant = "primary" | "secondary";
type Size = "md" | "lg";
type Icon = ComponentType<{ size?: number; className?: string }>;

const base = "inline-flex shrink-0 cursor-pointer items-center justify-center gap-[0.8rem] rounded-card font-bold transition-[filter,transform] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";
const variants: Record<Variant, string> = {
  primary: "bg-secondary-base text-primary-base hover:brightness-95",
  secondary: "bg-field text-ink hover:bg-[#f1f1f1]",
};
const sizes: Record<Size, string> = {
  md: "px-[1.5rem] py-4 type-body font-bold",
  lg: "h-[5.2rem] px-[2.5rem] type-body-lg font-bold",
};

function content(icon: Icon | undefined, size: Size, children: ReactNode) {
  const Icon = icon;
  return (
    <>
      {Icon && <Icon size={size === "lg" ? 24 : 20} className="shrink-0" />}
      {children}
    </>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size; icon?: Icon }) {
  return (
    <button type="button" className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {content(icon, size, children)}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size; icon?: Icon }) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {content(icon, size, children)}
    </Link>
  );
}
