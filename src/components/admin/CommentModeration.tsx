"use client";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { AdminDeleteComment, PostComment, SetCommentHidden } from "@/action/comments";
import { AuthorChip } from "@/components/ds/AuthorChip";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { FilterField, fold } from "@/components/ds/FilterField";
import { Modal, ModalActions, ModalBackButton } from "@/components/ds/Modal";
import { SegmentedTabs } from "@/components/ds/SegmentedTabs";
import { Comment2FillIcon, EyeCloseFillIcon, SendFillIcon } from "@/components/icons/mingcute";
import { EASE_OUT } from "@/components/motion/easing";
import { slugify } from "@/lib/Slugify";
import { timeAgo } from "@/lib/timeAgo";
import { cn } from "@/lib/utils";
import type { AdminComment } from "@/server/queries/admin";

type Filter = "all" | "visible" | "hidden";
const KIND_LABEL = { read: "Article", watch: "Vidéo" } as const;
const publicHref = (c: AdminComment) => `/${c.kind === "read" ? "reads" : "watches"}/${slugify(c.item.title, c.item.id)}`;
const name = (a: AdminComment["author"]) => `${a.firstName} ${a.lastName}`.trim();

// Commentaires: every comment, newest first. Hide (kept, shown to nobody; a placeholder when it has
// replies), show again, reply as yourself, or delete for good. Changes are optimistic.
export function CommentModeration({ comments }: { comments: AdminComment[] }) {
  const router = useRouter();
  const [list, setList] = useState(comments);
  const [source, setSource] = useState(comments);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<AdminComment | null>(null);
  const [pending, startTransition] = useTransition();

  // Fresh server data (after router.refresh) replaces the optimistic copy.
  if (source !== comments) {
    setSource(comments);
    setList(comments);
  }

  const counts = { all: list.length, visible: list.filter((c) => !c.hidden).length, hidden: list.filter((c) => c.hidden).length };
  const shown = useMemo(() => {
    const q = fold(query.trim());
    return list.filter(
      (c) =>
        (filter === "all" || (filter === "hidden") === c.hidden) &&
        (!q || fold(`${c.comment} ${name(c.author)} ${c.item.title}`).includes(q)),
    );
  }, [list, filter, query]);

  function act(change: (list: AdminComment[]) => AdminComment[], action: () => Promise<{ success: boolean; error?: string }>, done: string) {
    const before = list;
    setList(change);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setList(before);
        toast.error(result.error ?? "Une erreur est survenue.");
        return;
      }
      toast.success(done);
      router.refresh();
    });
  }

  const setHidden = (c: AdminComment, hidden: boolean) =>
    act(
      (l) => l.map((x) => (x.id === c.id ? { ...x, hidden } : x)),
      () => SetCommentHidden({ kind: c.kind, commentId: c.id, hidden }),
      hidden ? "Commentaire masqué" : "Commentaire de nouveau visible",
    );

  function remove(c: AdminComment) {
    setToDelete(null);
    act(
      (l) => l.filter((x) => x.id !== c.id && x.parent?.id !== c.id),
      () => AdminDeleteComment({ kind: c.kind, commentId: c.id }),
      "Commentaire supprimé",
    );
  }

  return (
    <section className="flex flex-col gap-[2.5rem]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedTabs
          label="Statut"
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: "all", label: `Tous (${counts.all})` },
            { value: "visible", label: `Visibles (${counts.visible})` },
            { value: "hidden", label: `Masqués (${counts.hidden})` },
          ]}
        />
        <FilterField value={query} onChange={setQuery} label="Texte, auteur ou contenu" />
      </div>

      {shown.length === 0 ? (
        <div className="mx-auto flex max-w-[36rem] flex-col items-center gap-[1.5rem] py-16 text-center">
          <Comment2FillIcon size={64} className="text-faint" />
          <p className="type-body font-medium text-faint">
            {query ? "Aucun commentaire ne correspond à cette recherche." : filter === "hidden" ? "Aucun commentaire masqué." : "Aucun commentaire."}
          </p>
        </div>
      ) : (
        <ul key={filter} className="flex flex-col divide-y divide-canvas">
          <AnimatePresence initial={false}>
            {shown.map((c, i) => (
              <motion.li
                key={`${c.kind}-${c.id}`}
                layout="position"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT, delay: Math.min(i, 10) * 0.04 } }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="flex flex-col gap-4 py-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <span className="flex min-w-0 items-center gap-4">
                    <AuthorChip author={c.author} variant="page" />
                    {c.hidden && (
                      <Badge icon={EyeCloseFillIcon} className="bg-field text-faint" iconClassName="">
                        Masqué
                      </Badge>
                    )}
                  </span>
                  <span className="type-body text-faint">il y a {timeAgo(c.createdAt)}</span>
                </div>
                <div className={cn("ml-[3.5rem] flex flex-col gap-4", c.hidden && "opacity-60")}>
                  {c.parent && <span className="type-body text-faint">En réponse à {c.parent.author || "un commentaire"}</span>}
                  <p className="rounded-card bg-canvas p-4 type-body break-words text-ink">{c.comment}</p>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <Link href={publicHref(c)} className="min-w-0 truncate type-body font-medium text-primary-base hover:underline">
                      {KIND_LABEL[c.kind]} · {c.item.title}
                    </Link>
                    <div className="flex shrink-0 items-center gap-[1.5rem]">
                      {!c.parent && !c.hidden && (
                        <TextAction onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}>Répondre</TextAction>
                      )}
                      <TextAction disabled={pending} onClick={() => setHidden(c, !c.hidden)}>
                        {c.hidden ? "Afficher" : "Masquer"}
                      </TextAction>
                      <TextAction disabled={pending} danger onClick={() => setToDelete(c)}>
                        Supprimer
                      </TextAction>
                    </div>
                  </div>
                  <AnimatePresence initial={false}>
                    {replyTo === c.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: EASE_OUT }}
                        className="overflow-hidden"
                      >
                        <ReplyForm
                          comment={c}
                          onCancel={() => setReplyTo(null)}
                          onSent={() => {
                            setReplyTo(null);
                            router.refresh();
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <Modal
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Supprimer ce commentaire ?"
        description={
          toDelete && toDelete.replyCount > 0
            ? `Il sera supprimé définitivement, avec ${toDelete.replyCount === 1 ? "sa réponse" : `ses ${toDelete.replyCount} réponses`}. Pour le retirer sans le perdre, masquez-le plutôt.`
            : "Il sera supprimé définitivement. Pour le retirer sans le perdre, masquez-le plutôt."
        }
      >
        <ModalActions>
          <ModalBackButton>Annuler</ModalBackButton>
          <div className="lg:w-[32rem]">
            <Button size="lg" className="w-full" disabled={pending} onClick={() => toDelete && remove(toDelete)}>
              Supprimer
            </Button>
          </div>
        </ModalActions>
      </Modal>
    </section>
  );
}

function TextAction({ children, onClick, disabled, danger }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "cursor-pointer type-body font-medium text-faint transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        danger ? "hover:text-danger" : "hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

// Reply as the signed-in admin (shown on the site like any reader's reply).
function ReplyForm({ comment, onCancel, onSent }: { comment: AdminComment; onCancel: () => void; onSent: () => void }) {
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const trimmed = text.trim();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (trimmed.length < 3) return void toast.error("La réponse doit contenir au moins 3 caractères.");
    startTransition(async () => {
      const result = await PostComment({ kind: comment.kind, itemId: comment.item.id, comment: trimmed, parentId: comment.id });
      if (!result.success) return void toast.error(result.error);
      toast.success("Réponse publiée");
      onSent();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col items-end gap-4 pt-2">
      <label className="flex h-[10rem] w-full flex-col gap-[0.4rem] rounded-card border border-transparent bg-field px-[1.4rem] py-[1.2rem] outline-2 outline-transparent transition-colors focus-within:border-primary-base focus-within:outline-focus-ring">
        <span className="text-[1rem] leading-none tracking-[-0.03rem] text-subtle">Votre réponse à {name(comment.author)}</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          autoFocus
          className="w-full flex-1 resize-none bg-transparent type-body text-ink outline-none"
        />
      </label>
      <div className="flex items-center gap-4">
        <Button variant="secondary" onClick={onCancel} disabled={pending}>
          Annuler
        </Button>
        <Button type="submit" icon={SendFillIcon} disabled={pending || !trimmed}>
          {pending ? "Envoi…" : "Répondre"}
        </Button>
      </div>
    </form>
  );
}
