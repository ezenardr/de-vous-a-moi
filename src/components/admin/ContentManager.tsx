"use client";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { SetContentArchived, SetContentFeatured, SwapContentFeatured } from "@/action/admin";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { FilterField, fold } from "@/components/ds/FilterField";
import { Modal, ModalActions, ModalBackButton } from "@/components/ds/Modal";
import { SegmentedTabs } from "@/components/ds/SegmentedTabs";
import {
  ArchiveFillIcon,
  ChartBarFillIcon,
  Comment2FillIcon,
  HeartFillIcon,
  InboxFillIcon,
  StarFillIcon,
  StarLineIcon,
  TimeFillIcon,
  TransferFillIcon,
} from "@/components/icons/mingcute";
import { EASE_OUT } from "@/components/motion/easing";
import { MAX_FEATURED } from "@/lib/featured";
import { formatBadgeDate, formatDateTime } from "@/lib/formatDate";
import { slugify } from "@/lib/Slugify";
import { cn } from "@/lib/utils";
import type { AdminContentItem, AdminContentKind, AdminContentStatus } from "@/server/queries/admin";

export type ContentTab = "reads" | "videos";
type StatusFilter = "all" | AdminContentStatus;

const fr = (n: number) => n.toLocaleString("fr-FR");
const KIND: Record<ContentTab, AdminContentKind> = { reads: "read", videos: "watch" };
const publicHref = (item: AdminContentItem) => `/${item.kind === "read" ? "reads" : "watches"}/${slugify(item.title, item.id)}`;
// The status an unarchived item goes back to.
const liveStatus = (item: AdminContentItem): AdminContentStatus => (new Date(item.publishedAt).getTime() > Date.now() ? "scheduled" : "published");
const WHERE: Record<AdminContentKind, string> = { read: "en tête de l'accueil", watch: "en tête de la page Vidéos" };

// Contenus: every read and video from every author. Featured slots on top (two per kind), then the
// list with status filters. Changes are optimistic and rolled back if the server refuses.
export function ContentManager({ reads, watches, initialTab }: { reads: AdminContentItem[]; watches: AdminContentItem[]; initialTab: ContentTab }) {
  const router = useRouter();
  const [tab, setTab] = useState<ContentTab>(initialTab);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState({ read: reads, watch: watches });
  const [swapFor, setSwapFor] = useState<AdminContentItem | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<AdminContentItem | null>(null);
  const [pending, startTransition] = useTransition();

  // Fresh server data (after router.refresh) replaces the optimistic copy.
  const [source, setSource] = useState({ reads, watches });
  if (source.reads !== reads || source.watches !== watches) {
    setSource({ reads, watches });
    setItems({ read: reads, watch: watches });
  }

  const kind = KIND[tab];
  const list = items[kind];
  const featured = list.filter((i) => i.featured);
  const counts = {
    all: list.length,
    published: list.filter((i) => i.status === "published").length,
    scheduled: list.filter((i) => i.status === "scheduled").length,
    archived: list.filter((i) => i.status === "archived").length,
  };
  const shown = useMemo(() => {
    const q = fold(query.trim());
    return list.filter((i) => (status === "all" || i.status === status) && (!q || fold(`${i.title} ${i.author} ${i.category}`).includes(q)));
  }, [list, status, query]);

  function switchTab(next: ContentTab) {
    setTab(next);
    setStatus("all");
    const url = new URL(window.location.href);
    if (next === "reads") url.searchParams.delete("tab");
    else url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url);
  }

  // Applies a local change, runs the action, and puts the previous list back if it fails.
  function run(change: (item: AdminContentItem) => AdminContentItem, action: () => Promise<{ success: boolean; error?: string }>, done: string) {
    const before = items;
    setItems((prev) => ({ ...prev, [kind]: prev[kind].map(change) }));
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setItems(before);
        toast.error(result.error ?? "Une erreur est survenue.");
        return;
      }
      toast.success(done);
      router.refresh();
    });
  }

  function toggleFeatured(item: AdminContentItem) {
    if (item.featured) {
      return run((i) => (i.id === item.id ? { ...i, featured: false } : i), () => SetContentFeatured({ kind, id: item.id, featured: false }), "Retiré de la vedette");
    }
    if (featured.length >= MAX_FEATURED) return setSwapFor(item);
    run((i) => (i.id === item.id ? { ...i, featured: true } : i), () => SetContentFeatured({ kind, id: item.id, featured: true }), "Mis en vedette");
  }

  function swap(out: AdminContentItem) {
    const incoming = swapFor!;
    setSwapFor(null);
    run(
      (i) => (i.id === out.id ? { ...i, featured: false } : i.id === incoming.id ? { ...i, featured: true } : i),
      () => SwapContentFeatured({ kind, outId: out.id, inId: incoming.id }),
      `« ${incoming.title} » remplace « ${out.title} »`,
    );
  }

  function setArchived(item: AdminContentItem, archived: boolean) {
    setArchiveTarget(null);
    const back = liveStatus(item);
    run(
      (i) => (i.id === item.id ? { ...i, status: archived ? "archived" : back, featured: archived ? false : i.featured } : i),
      () => SetContentArchived({ kind, id: item.id, archived }),
      archived ? "Archivé : il n'apparaît plus sur le site" : "Désarchivé",
    );
  }

  return (
    <section className="flex flex-col gap-[2.5rem]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedTabs
          label="Type de contenu"
          value={tab}
          onChange={switchTab}
          tabs={[
            { value: "reads", label: `Articles (${items.read.length})` },
            { value: "videos", label: `Vidéos (${items.watch.length})` },
          ]}
        />
        <FilterField value={query} onChange={setQuery} label="Titre, auteur ou catégorie" />
      </div>

      <FeaturedSlots key={kind} kind={kind} featured={featured} pending={pending} onRemove={toggleFeatured} />

      <div className="flex flex-col gap-6">
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:px-0">
          <SegmentedTabs
            label="Statut"
            value={status}
            onChange={setStatus}
            tabs={[
              { value: "all", label: `Tous (${counts.all})` },
              { value: "published", label: `Publiés (${counts.published})` },
              { value: "scheduled", label: `Programmés (${counts.scheduled})` },
              { value: "archived", label: `Archivés (${counts.archived})` },
            ]}
          />
        </div>
        {shown.length === 0 ? (
          <p className="py-16 text-center type-body font-medium text-faint">
            {query ? "Aucun contenu ne correspond à cette recherche." : "Aucun contenu dans cette catégorie."}
          </p>
        ) : (
          <ul key={`${kind}-${status}`} className="flex flex-col divide-y divide-canvas">
            <AnimatePresence initial={false}>
              {shown.map((item, i) => (
                <motion.li
                  key={item.id}
                  layout="position"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT, delay: Math.min(i, 10) * 0.04 } }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                >
                  <ContentRow
                    item={item}
                    pending={pending}
                    full={featured.length >= MAX_FEATURED}
                    onFeature={() => toggleFeatured(item)}
                    onArchive={() => (item.status === "archived" ? setArchived(item, false) : setArchiveTarget(item))}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <Modal
        open={!!swapFor}
        onOpenChange={(open) => !open && setSwapFor(null)}
        title="Remplacer un contenu en vedette"
        description={
          <>
            Les {MAX_FEATURED} emplacements sont pris. Choisissez celui que « {swapFor?.title} » remplacera.
          </>
        }
      >
        <ul className="flex flex-col gap-4">
          {featured.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => swap(item)}
                className="group flex w-full cursor-pointer items-center gap-4 rounded-card border-[1.5px] border-canvas p-4 text-left transition-colors hover:border-secondary-base hover:bg-secondary-100"
              >
                <Thumb src={item.imageUrl} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate type-body-lg font-medium text-ink">{item.title}</span>
                  <span className="truncate type-body text-faint">{item.author}</span>
                </span>
                <TransferFillIcon size={20} className="shrink-0 text-faint transition-colors group-hover:text-primary-base" />
              </button>
            </li>
          ))}
        </ul>
        <ModalActions>
          <ModalBackButton>Annuler</ModalBackButton>
        </ModalActions>
      </Modal>

      <Modal
        open={!!archiveTarget}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        title="Archiver ce contenu ?"
        description={
          <>
            « {archiveTarget?.title} » disparaîtra du site (listes, recherche, lien direct){archiveTarget?.featured ? " et de la vedette" : ""}. Vous pourrez le
            désarchiver à tout moment.
          </>
        }
      >
        <ModalActions>
          <ModalBackButton>Annuler</ModalBackButton>
          <div className="lg:w-[32rem]">
            <Button size="lg" icon={ArchiveFillIcon} className="w-full" disabled={pending} onClick={() => archiveTarget && setArchived(archiveTarget, true)}>
              Archiver
            </Button>
          </div>
        </ModalActions>
      </Modal>
    </section>
  );
}

function Thumb({ src, className }: { src: string; className?: string }) {
  return (
    <span className={cn("relative h-[5.6rem] w-[8.4rem] shrink-0 overflow-hidden rounded-card bg-field", className)}>
      <Image src={src} alt="" fill sizes="84px" className="object-cover" />
    </span>
  );
}

// Two slots: the featured items as cards with "Retirer", or a dashed free slot.
function FeaturedSlots({
  kind,
  featured,
  pending,
  onRemove,
}: {
  kind: AdminContentKind;
  featured: AdminContentItem[];
  pending: boolean;
  onRemove: (item: AdminContentItem) => void;
}) {
  const slots = Array.from({ length: MAX_FEATURED }, (_, i) => featured[i] ?? null);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-[0.4rem]">
        <h2 className="type-body-lg font-bold text-heading">En vedette</h2>
        <p className="type-body text-faint">
          Affichés {WHERE[kind]}. Un emplacement libre est rempli par le contenu le plus récent.
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {slots.map((item, i) => (
          <motion.li
            key={item?.id ?? `free-${i}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {item ? (
              <div className="flex items-center gap-4 rounded-panel border-[1.5px] border-secondary-base bg-secondary-100 p-4">
                <Thumb src={item.imageUrl} className="h-[7.2rem] w-[10.8rem]" />
                <span className="flex min-w-0 flex-1 flex-col gap-[0.4rem]">
                  <Link href={publicHref(item)} className="line-clamp-2 type-body-lg font-medium text-ink hover:underline">
                    {item.title}
                  </Link>
                  <span className="truncate type-body text-subtle">{item.author}</span>
                </span>
                <Button variant="secondary" className="bg-white" disabled={pending} onClick={() => onRemove(item)}>
                  Retirer
                </Button>
              </div>
            ) : (
              <div className="flex h-full min-h-[10.4rem] items-center justify-center gap-4 rounded-panel border-[1.5px] border-dashed border-divider p-4 text-center type-body text-faint">
                <StarLineIcon size={20} className="shrink-0" />
                Emplacement libre : choisissez un contenu publié avec l&apos;étoile.
              </div>
            )}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

const STATUS_BADGE: Record<AdminContentStatus, { label: string; className: string }> = {
  published: { label: "Publié", className: "bg-success-bg text-success" },
  scheduled: { label: "Programmé", className: "bg-secondary-base text-primary-base" },
  archived: { label: "Archivé", className: "bg-field text-faint" },
};

// One item: cover, title (links to the public page when it is live), author · category · date,
// status, numbers, then the star and archive buttons. On phones the numbers and buttons wrap below.
function ContentRow({
  item,
  pending,
  full,
  onFeature,
  onArchive,
}: {
  item: AdminContentItem;
  pending: boolean;
  full: boolean;
  onFeature: () => void;
  onArchive: () => void;
}) {
  const live = item.status === "published";
  const badge = STATUS_BADGE[item.status];
  const starTitle = item.featured ? "Retirer de la vedette" : !live ? "Seul un contenu publié peut être mis en vedette" : full ? "Remplacer un contenu en vedette" : "Mettre en vedette";

  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-4 py-6 lg:flex-nowrap lg:gap-x-6", item.status === "archived" && "opacity-70")}>
      <div className="flex min-w-0 flex-1 basis-full items-center gap-4 lg:basis-auto">
        <Thumb src={item.imageUrl} className={cn(item.status !== "published" && "grayscale-[35%]")} />
        <div className="flex min-w-0 flex-col gap-[0.2rem]">
          {live ? (
            <Link href={publicHref(item)} className="truncate type-body-lg font-medium text-ink hover:underline">
              {item.title}
            </Link>
          ) : (
            <span className="truncate type-body-lg font-medium text-ink">{item.title}</span>
          )}
          <span className="truncate type-body text-faint">
            {item.author} · {item.category} · {item.status === "scheduled" ? formatDateTime(item.publishedAt) : formatBadgeDate(item.publishedAt)}
          </span>
        </div>
      </div>

      <Badge className={badge.className} icon={item.status === "scheduled" ? TimeFillIcon : item.status === "archived" ? ArchiveFillIcon : undefined} iconClassName="">
        {badge.label}
      </Badge>

      <div className="flex shrink-0 items-center gap-4 type-body text-subtle tabular-nums lg:w-[19rem] lg:gap-6">
        <span className="flex items-center gap-[0.4rem]" title="Vues">
          <ChartBarFillIcon size={16} className="text-faint" />
          {fr(item.views)}
        </span>
        <span className="flex items-center gap-[0.4rem]" title="J'aime">
          <HeartFillIcon size={16} className="text-faint" />
          {fr(item.likes)}
        </span>
        <span className="flex items-center gap-[0.4rem]" title="Commentaires">
          <Comment2FillIcon size={16} className="text-faint" />
          {fr(item.comments)}
        </span>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-[0.8rem]">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={onFeature}
          disabled={pending || (!item.featured && !live)}
          title={starTitle}
          aria-label={starTitle}
          aria-pressed={item.featured}
          className={cn(
            "flex size-[4rem] cursor-pointer items-center justify-center rounded-pill transition-colors disabled:cursor-not-allowed disabled:opacity-40",
            item.featured ? "bg-secondary-base text-primary-base" : "bg-field text-faint hover:text-primary-base",
          )}
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={item.featured ? "on" : "off"}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {item.featured ? <StarFillIcon size={20} /> : <StarLineIcon size={20} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
        {/* Icon only on phones, so the numbers and both buttons share one line. */}
        <Button
          variant="secondary"
          icon={item.status === "archived" ? InboxFillIcon : ArchiveFillIcon}
          disabled={pending}
          onClick={onArchive}
          aria-label={item.status === "archived" ? "Désarchiver" : "Archiver"}
          className="size-[4rem] p-0 lg:size-auto lg:w-[13.5rem] lg:px-[1.5rem] lg:py-4"
        >
          <span className="hidden lg:inline">{item.status === "archived" ? "Désarchiver" : "Archiver"}</span>
        </Button>
      </div>
    </div>
  );
}
