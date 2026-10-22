"use client";
import { AnimatePresence, motion } from "motion/react";
import { InformationFillIcon } from "@/components/icons/mingcute";
import { EASE_OUT } from "@/components/motion/easing";
import { cn } from "@/lib/utils";

// Same rules as passwordSchema (lib/validation/auth.ts), shown as the Figma chips (153:10376):
// #f8f8f8 / Geist 12 #a3a3a3 while unmet, #edf6ec / #349c2e once met (153:10547).
export const PASSWORD_RULES = [
  { label: "Au moins 8 caractères", test: (v: string) => v.length >= 8 },
  { label: "Lettre majuscule", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Lettre minuscule", test: (v: string) => /[a-z]/.test(v) },
  { label: "Chiffre", test: (v: string) => /[0-9]/.test(v) },
  { label: "Caractère spécial", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

// Appears once the password field is focused or filled, as in Figma.
export function PasswordCriteria({ value, visible }: { value: string; visible: boolean }) {
  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="flex flex-col gap-4 overflow-hidden"
        >
          <p className="flex items-center gap-[0.4rem] text-[1.2rem] leading-none tracking-[-0.036rem] text-ink">
            <InformationFillIcon size={12} className="shrink-0" />
            Votre mot de passe doit respecter ces critères :
          </p>
          <ul className="flex flex-wrap gap-[0.8rem]" aria-label="Critères du mot de passe">
            {PASSWORD_RULES.map((rule) => {
              const met = rule.test(value);
              return (
                <li
                  key={rule.label}
                  className={cn(
                    "rounded-[2rem] px-[0.8rem] py-[0.4rem] font-primary text-[1.2rem] leading-[1.45] tracking-[-0.036rem] transition-colors duration-300",
                    met ? "bg-success-bg text-success" : "bg-field text-faint",
                  )}
                >
                  <span className="sr-only">{met ? "Respecté : " : "Manquant : "}</span>
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
