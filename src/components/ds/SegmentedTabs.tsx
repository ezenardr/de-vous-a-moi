"use client";
import { motion } from "motion/react";
import { useId } from "react";
import { EASE_OUT } from "@/components/motion/easing";
import { cn } from "@/lib/utils";

// Figma "Tabs" (153:15597): a #f8f8f8 track (5px padding, 7.5px radius, 4px gap); each tab 10 x 5px.
// Active: white, 1px #f5f5f5 border, 5px radius, soft shadow, Medium 14 #333. Inactive: Regular 14 #a3a3a3.
// The white pill slides between tabs.
export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  const id = useId();
  return (
    <div role="tablist" aria-label={label} className="inline-flex items-center gap-[0.4rem] self-start rounded-[0.75rem] bg-field p-[0.5rem]">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "relative cursor-pointer px-4 py-[0.5rem] type-body transition-colors",
              active ? "font-medium text-ink" : "text-faint hover:text-subtle",
            )}
          >
            {active && (
              <motion.span
                layoutId={`${id}-pill`}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className="absolute inset-0 rounded-card border border-[#f5f5f5] bg-white drop-shadow-[0_2px_5.3px_rgba(198,198,198,0.33)]"
              />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
