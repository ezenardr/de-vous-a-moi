"use client";
import { AnimatePresence, motion } from "motion/react";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { subscribeToNewsletter } from "@/action/user";
import { Button } from "@/components/ds/Button";
import { useSiteDialogs } from "@/components/dialogs/SiteDialogs";
import { CheckFillIcon, MailOpenFillIcon } from "@/components/icons/mingcute";
import { EASE_POP } from "@/components/motion/easing";

// Closing block: #163300 panel, white Bold 24 title, #cff3b7 text, lime button.
// Signed in: one click subscribes the reader's address. Visitors: opens the newsletter dialog.
export function NewsletterCta() {
  const { data: session, update } = useSession();
  const { openNewsletter } = useSiteDialogs();
  const [pending, startTransition] = useTransition();
  const [justSubscribed, setJustSubscribed] = useState(false);
  const subscribed = justSubscribed || session?.user?.newsletter === true;

  function subscribe() {
    startTransition(async () => {
      const result = await subscribeToNewsletter();
      if (!result.success) return void toast.error(result.error);
      setJustSubscribed(true);
      void update(); // the session reloads the profile from the database
    });
  }

  return (
    <div className="flex flex-col items-start gap-8 rounded-panel bg-primary-base p-8 lg:flex-row lg:items-center lg:justify-between lg:p-[4rem]">
      <div className="flex max-w-[60rem] flex-col gap-4">
        <h2 className="type-section font-bold text-white">Recevez nos prochaines histoires</h2>
        <p className="type-body-lg text-focus-ring">
          Une lettre de temps en temps, avec nos nouveaux articles et vidéos. Pas de spam, désinscription en un clic.
        </p>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {subscribed ? (
          <motion.p
            key="done"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: EASE_POP }}
            className="flex shrink-0 items-center gap-[0.8rem] rounded-card bg-white/10 px-[1.5rem] py-4 type-body font-bold text-white"
            role="status"
          >
            <CheckFillIcon className="text-secondary-base" />
            Vous êtes abonné·e
          </motion.p>
        ) : session?.user ? (
          <motion.span key="subscribe" exit={{ opacity: 0 }}>
            <Button size="lg" icon={MailOpenFillIcon} onClick={subscribe} disabled={pending}>
              {pending ? "Un instant…" : "Recevoir la newsletter"}
            </Button>
          </motion.span>
        ) : (
          <motion.span key="visitor" exit={{ opacity: 0 }}>
            <Button size="lg" icon={MailOpenFillIcon} onClick={openNewsletter}>
              Recevoir la newsletter
            </Button>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
