"use client";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { AdminUnsubscribe, CreateCampaign } from "@/action/campaigns";
import { Badge } from "@/components/ds/Badge";
import { Button, ButtonLink } from "@/components/ds/Button";
import { FilterField, fold } from "@/components/ds/FilterField";
import { Modal, ModalActions, ModalBackButton } from "@/components/ds/Modal";
import { SegmentedTabs } from "@/components/ds/SegmentedTabs";
import { StatTiles } from "@/components/ds/StatTiles";
import { Download2FillIcon, MailboxFillIcon, Pen2FillIcon, RightLineIcon } from "@/components/icons/mingcute";
import { EASE_OUT } from "@/components/motion/easing";
import { formatBadgeDate, formatDateTime } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import type { CampaignStatus, CampaignSummary } from "@/server/campaigns";
import type { AdminSubscriber } from "@/server/queries/admin";

export type NewsletterTab = "campaigns" | "subscribers";
const fr = (n: number) => n.toLocaleString("fr-FR");

export const CAMPAIGN_STATUS: Record<CampaignStatus, { label: string; className: string }> = {
  draft: { label: "Brouillon", className: "bg-field text-subtle" },
  sending: { label: "Envoi en cours", className: "bg-secondary-base text-primary-base" },
  sent: { label: "Envoyée", className: "bg-success-bg text-success" },
};

// Admin › Newsletter: the newsletters (drafts first to hand, newest first) and the subscriber list.
export function NewsletterAdmin({
  campaigns,
  subscribers,
  initialTab,
}: {
  campaigns: CampaignSummary[];
  subscribers: AdminSubscriber[];
  initialTab: NewsletterTab;
}) {
  const [tab, setTab] = useState<NewsletterTab>(initialTab);
  const active = subscribers.filter((s) => s.status === "active").length;

  function switchTab(next: NewsletterTab) {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "campaigns") url.searchParams.delete("tab");
    else url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url);
  }

  return (
    <section className="flex flex-col gap-[2.5rem]">
      <StatTiles
        compact
        stats={[
          { label: "abonnés actifs", value: active },
          { label: "désinscrits", value: subscribers.length - active },
          { label: "newsletters envoyées", value: campaigns.filter((c) => c.status === "sent").length },
          { label: "emails délivrés", value: campaigns.reduce((n, c) => n + c.deliveries.sent, 0) },
          { label: "brouillons", value: campaigns.filter((c) => c.status === "draft").length },
        ]}
      />
      <SegmentedTabs
        label="Newsletter"
        value={tab}
        onChange={switchTab}
        tabs={[
          { value: "campaigns", label: `Envois (${campaigns.length})` },
          { value: "subscribers", label: `Abonnés (${active})` },
        ]}
      />
      {tab === "campaigns" ? <Campaigns campaigns={campaigns} /> : <Subscribers subscribers={subscribers} />}
    </section>
  );
}

function Campaigns({ campaigns }: { campaigns: CampaignSummary[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const create = () =>
    startTransition(async () => {
      const result = await CreateCampaign();
      if (!result.success) return void toast.error(result.error);
      router.push(`/admin/newsletter/${result.campaignId}`);
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <p className="type-body text-faint">Écrivez, testez puis envoyez à toute la liste.</p>
        <Button icon={Pen2FillIcon} disabled={pending} onClick={create}>
          Nouvelle newsletter
        </Button>
      </div>
      {campaigns.length === 0 ? (
        <div className="mx-auto flex max-w-[36rem] flex-col items-center gap-[1.5rem] py-16 text-center">
          <MailboxFillIcon size={64} className="text-faint" />
          <p className="type-body font-medium text-faint">Aucune newsletter pour le moment. « Nouvelle newsletter » ouvre un brouillon.</p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-canvas">
          {campaigns.map((c, i) => {
            const status = CAMPAIGN_STATUS[c.status];
            return (
              <motion.li
                key={c.campaignId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE_OUT, delay: Math.min(i, 10) * 0.04 }}
              >
                <Link href={`/admin/newsletter/${c.campaignId}`} className="group flex flex-wrap items-center gap-x-6 gap-y-2 py-6 lg:flex-nowrap">
                  <span className="flex min-w-0 flex-1 basis-full flex-col gap-[0.2rem] lg:basis-auto">
                    <span className={cn("truncate type-body-lg font-medium group-hover:underline", c.subject ? "text-ink" : "text-faint")}>{c.subject || "Sans objet"}</span>
                    <span className="type-body text-faint">
                      {c.sentAt ? `Envoyée le ${formatDateTime(c.sentAt)}` : `Modifiée le ${formatDateTime(c.updatedAt)}`}
                    </span>
                  </span>
                  {c.deliveries.total > 0 && (
                    <span className="type-body text-subtle tabular-nums">
                      {fr(c.deliveries.sent)} envoyés{c.deliveries.failed > 0 && <span className="text-danger"> · {fr(c.deliveries.failed)} échecs</span>}
                    </span>
                  )}
                  <Badge className={status.className} iconClassName="">
                    {status.label}
                  </Badge>
                  <RightLineIcon className="hidden shrink-0 text-faint transition-transform group-hover:translate-x-[0.3rem] lg:block" />
                </Link>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Subscribers({ subscribers }: { subscribers: AdminSubscriber[] }) {
  const router = useRouter();
  const [list, setList] = useState(subscribers);
  const [source, setSource] = useState(subscribers);
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<AdminSubscriber | null>(null);
  const [pending, startTransition] = useTransition();

  if (source !== subscribers) {
    setSource(subscribers);
    setList(subscribers);
  }

  const shown = useMemo(() => {
    const q = fold(query.trim());
    return list.filter((s) => !q || fold(`${s.email} ${s.account ?? ""}`).includes(q));
  }, [list, query]);

  function unsubscribe(subscriber: AdminSubscriber) {
    setTarget(null);
    const before = list;
    setList((l) => l.map((s) => (s.email === subscriber.email ? { ...s, status: "unsubscribed" } : s)));
    startTransition(async () => {
      const result = await AdminUnsubscribe({ email: subscriber.email });
      if (!result.success) {
        setList(before);
        return void toast.error(result.error);
      }
      toast.success("Adresse désinscrite");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterField value={query} onChange={setQuery} label="E-mail ou nom" />
        <ButtonLink href="/admin/newsletter/subscribers.csv" prefetch={false} variant="secondary" icon={Download2FillIcon} className="self-start lg:self-auto">
          Exporter (CSV)
        </ButtonLink>
      </div>
      {shown.length === 0 ? (
        <div className="mx-auto flex max-w-[36rem] flex-col items-center gap-[1.5rem] py-16 text-center">
          <MailboxFillIcon size={64} className="text-faint" />
          <p className="type-body font-medium text-faint">
            {query ? "Aucune adresse ne correspond à cette recherche." : "Personne n'est encore inscrit. Les inscriptions arrivent par le bandeau newsletter du site et le réglage du compte."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-canvas">
          <AnimatePresence initial={false}>
            {shown.map((s) => (
              <motion.li key={s.email} layout="position" className={cn("flex flex-wrap items-center gap-x-6 gap-y-2 py-[1.2rem]", s.status !== "active" && "opacity-60")}>
                <span className="flex min-w-0 flex-1 basis-full flex-col lg:basis-auto">
                  <span className="truncate type-body font-medium text-ink">{s.email}</span>
                  <span className="truncate type-body text-faint">
                    {s.account ? `${s.account} · ` : ""}
                    {s.status === "active" ? `inscrit le ${formatBadgeDate(s.createdAt).toLowerCase()}` : `désinscrit le ${formatBadgeDate(s.updatedAt).toLowerCase()}`}
                  </span>
                </span>
                {s.status === "active" ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setTarget(s)}
                    className="cursor-pointer type-body font-medium text-faint transition-colors hover:text-danger disabled:opacity-50"
                  >
                    Désinscrire
                  </button>
                ) : (
                  <Badge className="bg-field text-faint" iconClassName="">
                    Désinscrit
                  </Badge>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
      <Modal
        open={!!target}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Désinscrire cette adresse ?"
        description={`${target?.email ?? ""} ne recevra plus la newsletter. La personne pourra se réinscrire elle-même.`}
      >
        <ModalActions>
          <ModalBackButton>Annuler</ModalBackButton>
          <div className="lg:w-[32rem]">
            <Button size="lg" className="w-full" disabled={pending} onClick={() => target && unsubscribe(target)}>
              Désinscrire
            </Button>
          </div>
        </ModalActions>
      </Modal>
    </div>
  );
}
