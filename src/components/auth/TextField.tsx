"use client";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type InputHTMLAttributes, type Ref } from "react";
import { Eye2FillIcon, EyeCloseFillIcon, InformationFillIcon } from "@/components/icons/mingcute";
import { EASE_OUT } from "@/components/motion/easing";
import { cn } from "@/lib/utils";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder"> & {
  label: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
};

// Figma "Textfields/single-line" (13:8857): 52px, #f8f8f8, 5px radius, 14px padding.
// Empty: the label sits in the field (Regular 14 #767676). Focused ("Opened", 13:8802): #163300 border,
// 2px #cff3b7 ring, the label shrinks to 10px above the value. Filled: only the value (#333).
// Done in CSS (peer selectors), so browser autofill gets the filled look too. Only transform and opacity
// animate (compositor): the label rises 8px and scales 14 → 10px (0.714) from its left edge; the value
// moves down 7px while focused, where it used to get 14px of top padding.
// Password fields get the eye toggle (16px). Errors: red border and a 12px message row.
export function TextField({ label, error, type = "text", className, id, ...props }: Props) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={cn("flex w-full flex-col gap-[0.8rem]", className)}>
      <div
        className={cn(
          "relative flex h-[5.2rem] w-full items-center gap-4 rounded-card border bg-field px-[1.4rem] ring-2 transition-[border-color,box-shadow] duration-200",
          error
            ? "border-danger ring-transparent focus-within:ring-danger/20"
            : "border-transparent ring-transparent focus-within:border-primary-base focus-within:ring-focus-ring",
        )}
      >
        <input
          id={inputId}
          type={isPassword && revealed ? "text" : type}
          placeholder=" "
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="peer h-full w-full min-w-0 bg-transparent text-[1.4rem] leading-none tracking-[-0.042rem] text-ink outline-none transition-transform duration-200 focus:translate-y-[0.7rem]"
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute left-[1.4rem] origin-left text-subtle transition-[transform,opacity] duration-200",
            // Filled and not focused: the value speaks for itself.
            "top-1/2 -translate-y-1/2 text-[1.4rem] leading-none tracking-[-0.042rem] opacity-0",
            "peer-[:placeholder-shown:not(:focus)]:opacity-100",
            "peer-focus:-translate-y-[calc(50%+0.8rem)] peer-focus:scale-[0.714] peer-focus:opacity-100",
          )}
        >
          {label}
        </label>
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={revealed}
            className="flex shrink-0 cursor-pointer text-ink"
          >
            {revealed ? <EyeCloseFillIcon size={16} /> : <Eye2FillIcon size={16} />}
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="flex items-center gap-[0.4rem] overflow-hidden text-[1.2rem] leading-[1.2] tracking-[-0.036rem] text-danger"
          >
            <InformationFillIcon size={12} className="shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
