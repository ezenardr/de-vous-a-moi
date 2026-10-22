"use client";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// Figma "Toggle" (111:10966 / 111:10968): 40 x 25 pill, #163300 on / #e8e8e8 off, 20px white knob
// inset 2.5px. The knob springs across.
export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-[2.5rem] w-16 shrink-0 cursor-pointer rounded-pill transition-colors duration-200 disabled:cursor-wait",
        checked ? "bg-primary-base" : "bg-divider",
      )}
    >
      <motion.span
        aria-hidden
        className="absolute top-[0.25rem] left-[0.25rem] size-8 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
        animate={{ x: checked ? 15 : 0 }}
        transition={{ type: "spring", stiffness: 600, damping: 35 }}
      />
    </button>
  );
}
