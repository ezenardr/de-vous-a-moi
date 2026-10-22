"use client";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Button } from "@/components/ds/Button";

// Figma "Button / primary" at 52px: lime when the form is complete, #e8e8e8 with white text before.
export function SubmitButton({ disabled, pending, children }: { disabled?: boolean; pending?: boolean; children: ReactNode }) {
  return (
    <Button
      type="submit"
      size="lg"
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className="w-full transition-colors duration-300 disabled:bg-divider disabled:text-white disabled:opacity-100"
    >
      {pending ? <Dots /> : children}
    </Button>
  );
}

// Three dots that breathe in turn: pending buttons and "Signing you in".
export function Dots({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="mx-[0.15rem] inline-block size-[0.5rem] rounded-full bg-current"
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}
