"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ds/Button";
import { Modal, ModalActions, ModalBackButton } from "@/components/ds/Modal";
import { SendFillIcon, TimeFillIcon } from "@/components/icons/mingcute";
import { EASE_OUT } from "@/components/motion/easing";
import { formatDateTime } from "@/lib/formatDate";
import { cn } from "@/lib/utils";

// <input type="datetime-local"> value for a Date, in local time ("2026-10-24T09:00").
const toLocalInput = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Publish dialog: "Maintenant" or "Programmer" with a date and time (at least 5 minutes ahead, at most a
// year). onConfirm gets an ISO date for a schedule, or undefined for now.
export function ScheduleDialog({
  open,
  onOpenChange,
  title = "Publier",
  initial,
  allowNow = true,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  initial?: string;
  allowNow?: boolean;
  pending?: boolean;
  onConfirm: (publishAt: string | undefined) => void;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={allowNow ? "Publiez tout de suite, ou choisissez le moment où vos lecteurs le découvriront." : "Choisissez la nouvelle date de publication."}
    >
      {/* Mounted per opening, so the allowed range starts from now. */}
      {open && <ScheduleForm initial={initial} allowNow={allowNow} pending={pending} onConfirm={onConfirm} />}
    </Modal>
  );
}

function ScheduleForm({
  initial,
  allowNow,
  pending,
  onConfirm,
}: {
  initial?: string;
  allowNow: boolean;
  pending?: boolean;
  onConfirm: (publishAt: string | undefined) => void;
}) {
  const [opened] = useState(() => Date.now());
  const [mode, setMode] = useState<"now" | "later">(allowNow && !initial ? "now" : "later");
  const [value, setValue] = useState(() => toLocalInput(initial ? new Date(initial) : new Date(opened + 24 * 3600_000)));
  const min = toLocalInput(new Date(opened + 5 * 60_000));
  const max = toLocalInput(new Date(opened + 364 * 24 * 3600_000));
  const chosen = new Date(value);
  const valid = mode === "now" || (!Number.isNaN(chosen.getTime()) && value >= min && value <= max);

  const option = (key: "now" | "later", label: string, hint: string, Icon: typeof SendFillIcon) => (
    <button
      type="button"
      role="radio"
      aria-checked={mode === key}
      onClick={() => setMode(key)}
      className={cn(
        "flex flex-1 cursor-pointer items-start gap-4 rounded-card border p-[1.5rem] text-left transition-colors",
        mode === key ? "border-primary-base bg-secondary-100" : "border-divider bg-white hover:bg-field",
      )}
    >
      <Icon className={cn("mt-[0.2rem] shrink-0", mode === key ? "text-primary-base" : "text-faint")} />
      <span className="flex flex-col gap-[0.3rem]">
        <span className="type-body-lg font-bold text-ink">{label}</span>
        <span className="type-body text-faint">{hint}</span>
      </span>
    </button>
  );

  return (
    <div className="relative flex flex-col gap-[2.5rem]">
      {allowNow && (
        <div role="radiogroup" aria-label="Moment de publication" className="flex flex-col gap-4 lg:flex-row">
          {option("now", "Maintenant", "Visible dès la publication", SendFillIcon)}
          {option("later", "Programmer", "À la date de votre choix", TimeFillIcon)}
        </div>
      )}
      <AnimatePresence initial={false}>
        {mode === "later" && (
          <motion.label
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="flex flex-col gap-[0.8rem] overflow-hidden"
          >
            <span className="type-body font-medium text-ink">Date et heure</span>
            <input
              type="datetime-local"
              value={value}
              min={min}
              max={max}
              onChange={(e) => setValue(e.target.value)}
              className="h-[5.2rem] rounded-card border border-transparent bg-field px-[1.4rem] type-body text-ink outline-none focus:border-primary-base focus:ring-2 focus:ring-focus-ring"
            />
            <span className={cn("type-body", valid ? "text-faint" : "text-danger")}>
              {valid ? `Publication le ${formatDateTime(chosen)} (heure de votre appareil).` : "Choisissez une date entre maintenant et dans un an."}
            </span>
          </motion.label>
        )}
      </AnimatePresence>
      <ModalActions>
        <ModalBackButton>Annuler</ModalBackButton>
        <div className="lg:w-[32rem]">
          <Button
            size="lg"
            className="w-full"
            disabled={!valid || pending}
            onClick={() => onConfirm(mode === "now" ? undefined : chosen.toISOString())}
          >
            {pending ? "Un instant…" : mode === "now" ? "Publier maintenant" : "Programmer"}
          </Button>
        </div>
      </ModalActions>
    </div>
  );
}
