"use client";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AccountDialog } from "@/components/account/AccountDialog";
import { NewsletterDialog } from "@/components/newsletter/NewsletterDialog";

type Dialog = "newsletter" | "account" | null;
const SiteDialogsContext = createContext<{ openNewsletter: () => void; openAccount: () => void } | null>(null);

// The site-wide dialogs (newsletter, account), mounted once by AppLayout so anything can open them:
// the nav (also from the mobile drawer, which closes itself), the About page…
export function SiteDialogsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<Dialog>(null);
  // A new key per opening gives the newsletter form a fresh start (and its own opening time).
  const [newsletterKey, setNewsletterKey] = useState(0);
  const openNewsletter = useCallback(() => {
    setNewsletterKey((k) => k + 1);
    setOpen("newsletter");
  }, []);
  const openAccount = useCallback(() => setOpen("account"), []);
  const value = useMemo(() => ({ openNewsletter, openAccount }), [openNewsletter, openAccount]);
  const toggle = (dialog: Exclude<Dialog, null>) => (next: boolean) => setOpen(next ? dialog : null);
  return (
    <SiteDialogsContext.Provider value={value}>
      {children}
      <NewsletterDialog key={newsletterKey} open={open === "newsletter"} onOpenChange={toggle("newsletter")} />
      <AccountDialog open={open === "account"} onOpenChange={toggle("account")} />
    </SiteDialogsContext.Provider>
  );
}

export function useSiteDialogs() {
  const value = useContext(SiteDialogsContext);
  if (!value) throw new Error("useSiteDialogs must be used inside SiteDialogsProvider");
  return value;
}
