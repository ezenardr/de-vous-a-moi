"use client";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import type { Editor as TinyEditor } from "tinymce";
import { DeleteCampaign, ResumeCampaign, SaveCampaign, SendCampaign, SendCampaignTest } from "@/action/campaigns";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { FilterField, fold } from "@/components/ds/FilterField";
import { Modal, ModalActions, ModalBackButton } from "@/components/ds/Modal";
import { StatTiles } from "@/components/ds/StatTiles";
import { CloseLineIcon, LeftLineIcon, MailOpenFillIcon, SendFillIcon } from "@/components/icons/mingcute";
import { EASE_OUT } from "@/components/motion/easing";
import { formatBadgeDate, formatDateTime } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import type { CampaignDetail, CampaignItemRef } from "@/server/campaigns";
import type { PickableItem } from "@/server/queries/admin";
import { CAMPAIGN_STATUS } from "./NewsletterAdmin";

// TinyMCE is heavy and browser-only: loaded on the client, after the page.
const BundledEditor = dynamic(() => import("@/components/shared/BundledEditor"), {
  ssr: false,
  loading: () => <div className="h-[36rem] animate-pulse rounded-card bg-field" />,
});

const SUBJECT_MAX = 200;
const PREHEADER_MAX = 200;
const MAX_ITEMS = 4;
const KIND_LABEL = { read: "Article", watch: "Vidéo" } as const;
const fr = (n: number) => n.toLocaleString("fr-FR");

function BackLink() {
  return (
    <Link href="/admin/newsletter" className="flex items-center gap-[0.4rem] self-start type-body font-medium text-subtle hover:text-ink">
      <LeftLineIcon size={18} />
      Newsletter
    </Link>
  );
}

// The email as subscribers will see it (saved version), in a sandboxed frame: no scripts; same origin
// only so the admin session cookie reaches the preview route.
function Preview({ campaignId, version, className }: { campaignId: string; version: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <span className="type-body font-medium text-subtle">Aperçu de l&apos;email (version enregistrée)</span>
      <iframe
        key={version}
        title="Aperçu de la newsletter"
        src={`/admin/newsletter/${campaignId}/preview?v=${version}`}
        sandbox="allow-same-origin"
        className="h-[70rem] w-full rounded-panel border-[1.5px] border-canvas bg-canvas"
      />
    </div>
  );
}

export function CampaignEditor({
  campaign,
  pickable,
  subscriberCount,
  adminEmail,
}: {
  campaign: CampaignDetail;
  pickable: PickableItem[];
  subscriberCount: number;
  adminEmail: string;
}) {
  if (campaign.status !== "draft") return <CampaignReport campaign={campaign} />;
  return <DraftEditor campaign={campaign} pickable={pickable} subscriberCount={subscriberCount} adminEmail={adminEmail} />;
}

function DraftEditor({ campaign, pickable, subscriberCount, adminEmail }: { campaign: CampaignDetail; pickable: PickableItem[]; subscriberCount: number; adminEmail: string }) {
  const router = useRouter();
  const editorRef = useRef<TinyEditor | null>(null);
  const [subject, setSubject] = useState(campaign.subject);
  const [preheader, setPreheader] = useState(campaign.preheader);
  const [items, setItems] = useState<CampaignItemRef[]>(campaign.items);
  const [dirty, setDirty] = useState(false);
  const [version, setVersion] = useState(() => Date.parse(campaign.updatedAt));
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<"send" | "delete" | null>(null);
  const [count, setCount] = useState(subscriberCount);
  const [pending, startTransition] = useTransition();
  const touch = () => setDirty(true);

  const byKey = useMemo(() => new Map(pickable.map((p) => [`${p.kind}:${p.id}`, p])), [pickable]);
  const chosen = items.flatMap((i) => byKey.get(`${i.kind}:${i.id}`) ?? []);
  const candidates = useMemo(() => {
    const q = fold(query.trim());
    const taken = new Set(items.map((i) => `${i.kind}:${i.id}`));
    return pickable.filter((p) => !taken.has(`${p.kind}:${p.id}`) && (!q || fold(p.title).includes(q))).slice(0, 8);
  }, [pickable, items, query]);

  // Leaving with unsaved changes asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save(): Promise<boolean> {
    const result = await SaveCampaign({ campaignId: campaign.campaignId, subject, preheader, body: editorRef.current?.getContent() ?? campaign.body, items });
    if (!result.success) {
      toast.error(result.error);
      return false;
    }
    setDirty(false);
    setVersion(Date.now());
    return true;
  }
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });

  const onSave = () =>
    startTransition(async () => {
      if (await save()) toast.success("Brouillon enregistré");
    });

  const onTest = () =>
    startTransition(async () => {
      if (!(await save())) return;
      const result = await SendCampaignTest({ campaignId: campaign.campaignId });
      if (!result.success) return void toast.error(result.error);
      toast.success(`Test envoyé à ${result.to}`);
    });

  const openSend = () =>
    startTransition(async () => {
      if (await save()) setDialog("send");
    });

  const onSend = () =>
    startTransition(async () => {
      const result = await SendCampaign({ campaignId: campaign.campaignId, expected: count });
      if (!result.success) {
        if ("count" in result && typeof result.count === "number") setCount(result.count);
        return void toast.error(result.error);
      }
      setDialog(null);
      toast.success(result.failed ? `${fr(result.sent)} envoyés, ${fr(result.failed)} échecs` : `Newsletter envoyée à ${fr(result.sent)} abonnés`);
      router.refresh();
    });

  const onDelete = () =>
    startTransition(async () => {
      const result = await DeleteCampaign({ campaignId: campaign.campaignId });
      if (!result.success) return void toast.error(result.error);
      setDirty(false);
      toast.success("Brouillon supprimé");
      router.push("/admin/newsletter");
    });

  return (
    <div className="flex flex-col gap-[2.5rem]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <BackLink />
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="secondary" disabled={pending} onClick={() => setDialog("delete")}>
            Supprimer
          </Button>
          <Button variant="secondary" disabled={pending || !dirty} onClick={onSave}>
            {dirty ? "Enregistrer" : "Enregistré"}
          </Button>
          <Button variant="secondary" icon={MailOpenFillIcon} disabled={pending} onClick={onTest}>
            M&apos;envoyer un test
          </Button>
          <Button icon={SendFillIcon} disabled={pending} onClick={openSend}>
            Envoyer…
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[3rem] xl:grid-cols-[minmax(0,1fr)_minmax(0,52rem)]">
        <div className="flex min-w-0 flex-col gap-[2.5rem]">
          <label className="flex flex-col gap-4">
            <span className="type-body font-medium text-subtle">Objet</span>
            <textarea
              value={subject}
              maxLength={SUBJECT_MAX}
              rows={1}
              onChange={(e) => {
                setSubject(e.target.value.replace(/\n/g, " "));
                touch();
              }}
              placeholder="L'objet de l'email"
              className="field-sizing-content min-h-[3.6rem] w-full resize-none bg-transparent text-[2.4rem] leading-[1.2] font-bold tracking-[-0.072rem] text-ink outline-none placeholder:text-placeholder"
            />
          </label>
          <label className="flex flex-col gap-4">
            <span className="type-body font-medium text-subtle">Texte d&apos;aperçu</span>
            <textarea
              value={preheader}
              maxLength={PREHEADER_MAX}
              rows={1}
              onChange={(e) => {
                setPreheader(e.target.value.replace(/\n/g, " "));
                touch();
              }}
              placeholder="Affiché après l'objet dans la boîte de réception (facultatif)"
              className="field-sizing-content min-h-[5rem] w-full resize-none rounded-card bg-field p-[1.4rem] type-body-lg text-ink outline-none placeholder:text-placeholder focus:ring-2 focus:ring-focus-ring"
            />
          </label>

          <div className="flex flex-col gap-4">
            <span className="type-body font-medium text-subtle">Message</span>
            <div className="overflow-hidden rounded-card border border-divider">
              <BundledEditor
                onInit={(_, editor) => {
                  editorRef.current = editor;
                  editor.addShortcut("meta+s", "Enregistrer", () => void saveRef.current());
                }}
                initialValue={campaign.body}
                onDirty={touch}
                onEditorChange={(_, editor) => {
                  if (editor.isDirty()) touch();
                }}
                init={{
                  height: 420,
                  min_height: 300,
                  menubar: false,
                  branding: false,
                  promotion: false,
                  // Only what the email keeps (server/email/newsletter-campaign.ts): no images or tables.
                  plugins: ["autolink", "lists", "link", "charmap"],
                  block_formats: "Paragraphe=p; Intertitre=h2; Sous-intertitre=h3",
                  toolbar: "undo redo | blocks | bold italic | bullist numlist blockquote | link | removeformat",
                  content_style:
                    "body { font-family: Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333; max-width: 520px; margin: 1.5rem auto; padding: 0 1rem } h2 { font-size: 22px } h3 { font-size: 18px }",
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-[0.4rem]">
              <span className="type-body font-medium text-subtle">
                Contenus à la une ({items.length}/{MAX_ITEMS})
              </span>
              <span className="type-body text-faint">Affichés en cartes sous le message, dans cet ordre.</span>
            </div>
            {chosen.length > 0 && (
              <ol className="flex flex-col gap-4">
                <AnimatePresence initial={false}>
                  {chosen.map((item, i) => (
                    <motion.li
                      key={`${item.kind}:${item.id}`}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.3, ease: EASE_OUT }}
                      className="flex items-center gap-4 rounded-card border-[1.5px] border-secondary-base bg-secondary-100 p-[0.8rem]"
                    >
                      <span className="w-[2rem] shrink-0 text-center type-body font-bold text-primary-base">{i + 1}</span>
                      <PickThumb src={item.imageUrl} />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate type-body font-medium text-ink">{item.title}</span>
                        <span className="type-body text-subtle">{KIND_LABEL[item.kind]}</span>
                      </span>
                      <button
                        type="button"
                        aria-label={`Retirer « ${item.title} »`}
                        onClick={() => {
                          setItems((l) => l.filter((x) => !(x.kind === item.kind && x.id === item.id)));
                          touch();
                        }}
                        className="flex size-[3.2rem] shrink-0 cursor-pointer items-center justify-center rounded-pill text-subtle hover:bg-white hover:text-ink"
                      >
                        <CloseLineIcon size={18} />
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ol>
            )}
            {items.length < MAX_ITEMS && (
              <div className="flex flex-col gap-4">
                <FilterField value={query} onChange={setQuery} label="Chercher un article ou une vidéo" />
                <ul className="flex flex-col divide-y divide-canvas">
                  {candidates.map((item) => (
                    <li key={`${item.kind}:${item.id}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setItems((l) => [...l, { kind: item.kind, id: item.id }]);
                          touch();
                        }}
                        className="group flex w-full cursor-pointer items-center gap-4 py-[0.8rem] text-left"
                      >
                        <PickThumb src={item.imageUrl} />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate type-body font-medium text-ink group-hover:underline">{item.title}</span>
                          <span className="type-body text-faint">
                            {KIND_LABEL[item.kind]} · {formatBadgeDate(item.publishedAt).toLowerCase()}
                          </span>
                        </span>
                        <span className="shrink-0 type-body font-bold text-primary-base">Ajouter</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <Preview campaignId={campaign.campaignId} version={version} className="xl:sticky xl:top-0 xl:self-start" />
      </div>

      <Modal
        open={dialog === "send"}
        onOpenChange={(open) => setDialog(open ? "send" : null)}
        title={count === 0 ? "Aucun abonné" : `Envoyer à ${fr(count)} abonné${count > 1 ? "s" : ""} ?`}
        description={
          count === 0
            ? "La liste est vide : rien ne peut être envoyé pour l'instant."
            : `« ${subject} » part maintenant, et l'envoi ne peut pas être annulé. Pensez à vous envoyer un test d'abord (${adminEmail}).`
        }
      >
        <ModalActions>
          <ModalBackButton>Annuler</ModalBackButton>
          {count > 0 && (
            <div className="lg:w-[32rem]">
              <Button size="lg" icon={SendFillIcon} className="w-full" disabled={pending} onClick={onSend}>
                {pending ? "Envoi…" : "Envoyer maintenant"}
              </Button>
            </div>
          )}
        </ModalActions>
      </Modal>
      <Modal open={dialog === "delete"} onOpenChange={(open) => setDialog(open ? "delete" : null)} title="Supprimer ce brouillon ?" description="Il sera supprimé définitivement.">
        <ModalActions>
          <ModalBackButton>Annuler</ModalBackButton>
          <div className="lg:w-[32rem]">
            <Button size="lg" className="w-full" disabled={pending} onClick={onDelete}>
              Supprimer
            </Button>
          </div>
        </ModalActions>
      </Modal>
    </div>
  );
}

function PickThumb({ src }: { src: string }) {
  return (
    <span className="relative h-[4.4rem] w-[6.6rem] shrink-0 overflow-hidden rounded-card bg-field">
      <Image src={src} alt="" fill sizes="66px" className="object-cover" />
    </span>
  );
}

// A newsletter that is sending or sent: the numbers, a retry when something was not delivered, and the email.
function CampaignReport({ campaign }: { campaign: CampaignDetail }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const status = CAMPAIGN_STATUS[campaign.status];
  const { total, sent, failed, skipped, pending: waiting } = campaign.deliveries;
  const retry = () =>
    startTransition(async () => {
      const result = await ResumeCampaign({ campaignId: campaign.campaignId });
      if (!result.success) return void toast.error(result.error);
      toast.success(`${fr(result.sent)} envoyés${result.failed ? `, ${fr(result.failed)} échecs` : ""}`);
      router.refresh();
    });

  return (
    <div className="flex flex-col gap-[2.5rem]">
      <BackLink />
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="type-section font-bold text-heading">{campaign.subject}</h2>
          <Badge className={status.className} iconClassName="">
            {status.label}
          </Badge>
        </div>
        {campaign.sentAt && <p className="type-body text-faint">Envoyée le {formatDateTime(campaign.sentAt)}</p>}
      </div>
      <StatTiles
        compact
        stats={[
          { label: "destinataires", value: total },
          { label: "envoyés", value: sent },
          { label: "échecs", value: failed },
          { label: "en attente", value: waiting },
          ...(skipped > 0 ? [{ label: "désinscrits entre-temps", value: skipped }] : []),
        ]}
      />
      {(failed > 0 || waiting > 0) && (
        <div className="flex flex-col gap-4 rounded-panel border-[1.5px] border-canvas p-8 lg:flex-row lg:items-center lg:justify-between">
          <p className="type-body text-subtle">
            {waiting > 0 ? "L'envoi a été interrompu. Reprenez-le pour les adresses restantes." : "Certains emails n'ont pas pu partir. Réessayez pour ces adresses seulement."}
            {" "}Personne ne reçoit l&apos;email deux fois.
          </p>
          <Button icon={SendFillIcon} disabled={pending} onClick={retry}>
            {waiting > 0 ? "Reprendre l'envoi" : "Réessayer les échecs"}
          </Button>
        </div>
      )}
      <Preview campaignId={campaign.campaignId} version={Date.parse(campaign.updatedAt)} className="max-w-[60rem]" />
    </div>
  );
}
