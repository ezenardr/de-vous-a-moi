"use client";
import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

// Loaded on demand: the dialogs' code (forms, validation, photo cropper, bot check) stays out of every
// page's first download. It is fetched when the browser is idle after load, so opening stays instant.
const loadNewsletter = () => import("@/components/newsletter/NewsletterDialog");
const loadAccount = () => import("@/components/account/AccountDialog");
const NewsletterDialog = dynamic(() => loadNewsletter().then((m) => m.NewsletterDialog), { ssr: false });
const AccountDialog = dynamic(() => loadAccount().then((m) => m.AccountDialog), { ssr: false });

type Dialog = "newsletter" | "account" | null;
const SiteDialogsContext = createContext<{ openNewsletter: () => void; openAccount: () => void } | null>(null);

// The site-wide dialogs (newsletter, account), mounted once by AppLayout so anything can open them:
// the nav (also from the mobile drawer, which closes itself), the About page…
export function SiteDialogsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<Dialog>(null);
  // Each dialog mounts on its first opening, then stays mounted (so its close animation still plays).
  const [used, setUsed] = useState({ newsletter: false, account: false });
  // A new key per opening gives the newsletter form a fresh start (and its own opening time).
  const [newsletterKey, setNewsletterKey] = useState(0);
  const openNewsletter = useCallback(() => {
    setNewsletterKey((k) => k + 1);
    setUsed((u) => ({ ...u, newsletter: true }));
    setOpen("newsletter");
  }, []);
  const openAccount = useCallback(() => {
    setUsed((u) => ({ ...u, account: true }));
    setOpen("account");
  }, []);
  const value = useMemo(() => ({ openNewsletter, openAccount }), [openNewsletter, openAccount]);
  const toggle = (dialog: Exclude<Dialog, null>) => (next: boolean) => setOpen(next ? dialog : null);

  useEffect(() => {
    const preload = () => void Promise.all([loadNewsletter(), loadAccount()]);
    // Safari has no requestIdleCallback: a short timeout instead.
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(preload, { timeout: 5000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(preload, 2000);
    return () => clearTimeout(id);
  }, []);

  return (
    <SiteDialogsContext.Provider value={value}>
      {children}
      {used.newsletter && <NewsletterDialog key={newsletterKey} open={open === "newsletter"} onOpenChange={toggle("newsletter")} />}
      {used.account && <AccountDialog open={open === "account"} onOpenChange={toggle("account")} />}
    </SiteDialogsContext.Provider>
  );
}

export function useSiteDialogs() {
  const value = useContext(SiteDialogsContext);
  if (!value) throw new Error("useSiteDialogs must be used inside SiteDialogsProvider");
  return value;
}
