"use client";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { EASE_OUT, EASE_POP } from "@/components/motion/easing";
import { cn } from "@/lib/utils";

type Icon = ComponentType<{ size?: number; className?: string }>;

// Figma auth card ("Form", e.g. 153:17556): white, 20px radius, 45px padding, 400px content.
// Mobile: a sheet from 114px down to the bottom, 30px / 15px padding, rounded top corners.
// status: the 550px card of "Please check your email" / "verified" screens, content centred (mobile too).
// tall: same 550px centred card on desktop (short forms, e.g. "Reset password"), top-aligned on mobile.
// stepKey: changing it cross-fades the content (form -> "check your email").
export function AuthCard({
  children,
  status = false,
  tall = false,
  stepKey,
}: {
  children: ReactNode;
  status?: boolean;
  tall?: boolean;
  stepKey?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className={cn(
        "relative z-10 mt-[11.4rem] flex w-full flex-1 flex-col rounded-t-[2rem] bg-white px-[1.5rem] pt-[3rem] pb-[4rem]",
        "lg:mt-0 lg:w-[49rem] lg:flex-none lg:rounded-[2rem] lg:p-[4.5rem]",
        status && "justify-center lg:min-h-[55rem]",
        tall && "lg:min-h-[55rem] lg:justify-center",
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stepKey ?? "content"}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="flex w-full flex-col gap-[3rem]"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}

// Title (Bold 32) and description (Regular 16 #a3a3a3), centred, 15px apart.
export function AuthHeading({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-[1.5rem] text-center">
      <h1 className="text-[3.2rem] leading-[1.2] font-bold tracking-[-0.096rem] text-black">{title}</h1>
      {children && <p className="type-body-lg text-faint">{children}</p>}
    </div>
  );
}

// Figma step indicator: "1 of 2" then a white pill with the step icon and name (desktop), top-right
// of the background; on mobile only "1 of 2", at the right of the logo row.
export function StepBadge({ step, total, label, icon: Icon }: { step: number; total: number; label: string; icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
      className="absolute top-[5.05rem] right-[1.5rem] z-20 flex items-center gap-[2rem] rounded-panel bg-field px-4 py-[0.5rem] font-primary backdrop-blur-[5px] lg:top-[2.4rem] lg:right-[2.5rem] lg:py-[0.4rem] lg:pr-[0.4rem] lg:pl-[1.6rem]"
    >
      <p className="type-body-lg font-semibold whitespace-nowrap text-black" aria-label={`Étape ${step} sur ${total}`}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={step}
            className="inline-block"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            {step}
          </motion.span>
        </AnimatePresence>{" "}
        <span className="text-faint">sur {total}</span>
      </p>
      <span className="hidden items-center gap-[0.8rem] rounded-panel bg-white px-[1.6rem] py-[0.8rem] type-body font-medium text-black lg:flex">
        <Icon className="shrink-0" />
        {label}
      </span>
    </motion.div>
  );
}

// Figma 100px #ecfae2 circle with a 54px icon (mailbox, check). Pops in.
export function StatusIcon({ icon: Icon, tone = "success" }: { icon: Icon; tone?: "success" | "danger" }) {
  return (
    <motion.span
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_POP, delay: 0.1 }}
      className={cn(
        "mx-auto flex size-[10rem] items-center justify-center rounded-full",
        tone === "success" ? "bg-secondary-100 text-primary-base" : "bg-danger-bg text-danger",
      )}
    >
      <Icon size={54} />
    </motion.span>
  );
}

// "Don't own an account? Sign up": Medium 16 #a3a3a3, then a Bold 14 #163300 link.
export function AuthFooter({ text, children }: { text?: string; children: ReactNode }) {
  return (
    <p className="flex flex-wrap items-center justify-center gap-[0.5rem] type-body-lg font-medium text-faint">
      {text}
      {children}
    </p>
  );
}

export function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("type-body font-bold text-primary-base underline-offset-4 hover:underline", className)}>
      {children}
    </Link>
  );
}

// "or" divider (Geist 16 #94a3b8).
export function OrDivider() {
  return <p className="text-center font-primary type-body-lg text-[#94a3b8]">ou</p>;
}

// Form-level message (rate limit, expired link…): red on #fdecea, or neutral for information.
export function FormNotice({ children, tone = "danger" }: { children: ReactNode; tone?: "danger" | "info" }) {
  return (
    <motion.p
      role={tone === "danger" ? "alert" : "status"}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      className={cn("rounded-card px-[1.4rem] py-4 type-body", tone === "danger" ? "bg-danger-bg text-danger" : "bg-field text-ink")}
    >
      {children}
    </motion.p>
  );
}
