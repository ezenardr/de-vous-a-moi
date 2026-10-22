"use client";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleReadLike, toggleWatchLike } from "@/action/engagement";
import { DeleteOwnComment, PostComment } from "@/action/comments";
import { Button, ButtonLink } from "@/components/ds/Button";
import { Modal, ModalActions, ModalBackButton } from "@/components/ds/Modal";
import { SignInPrompt } from "@/components/ds/SignInPrompt";
import {
  ChartBarFillIcon,
  Comment2FillIcon,
  HeartFillIcon,
  SendFillIcon,
  Share3FillIcon,
  User4FillIcon,
  UserAdd2FillIcon,
} from "@/components/icons/mingcute";
import { EASE_OUT, EASE_POP } from "@/components/motion/easing";
import { loginHref } from "@/lib/callbackUrl";
import { cn } from "@/lib/utils";
import type { PublicComment } from "@/server/queries/comments";
import type { ArticleEngagement as Engagement } from "@/server/queries/reads";

// Figma stats + comments block (153:12828 logged out, 153:13461 logged in).
// Left: 400px stats list (Medium 14 #a3a3a3 labels, #767676 20px icons, #333 counts, #e8e8e8 dividers).
// Right: comment field (logged in), then "Comments" and the list, or the empty state.
// Shared by articles and videos (kind="watch"): same Figma block on both pages.
export function ArticleEngagement({
  kind = "read",
  id,
  title,
  engagement,
}: {
  kind?: "read" | "watch";
  id: string;
  title: string;
  engagement: Engagement;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user;
  const [prompt, setPrompt] = useState(false);
  const [like, setLike] = useOptimistic({ liked: engagement.liked, likes: engagement.likes });
  const [, startTransition] = useTransition();
  const router = useRouter();
  const [threads, setThreads] = useState(engagement.comments);
  const [source, setSource] = useState(engagement.comments);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<PublicComment | null>(null);
  const [deleting, startDelete] = useTransition();

  // Fresh server data (after router.refresh) replaces the optimistic copy.
  if (source !== engagement.comments) {
    setSource(engagement.comments);
    setThreads(engagement.comments);
  }
  const author = user ? `${user.firstName} ${user.lastName ? `${user.lastName[0]}.` : ""}`.trim() : "";
  const commentCount = threads.reduce((n, c) => n + (c.hidden ? 0 : 1) + c.replies.length, 0);

  function addComment(comment: PublicComment, parentId?: string) {
    const mine = { ...comment, author };
    setThreads((list) =>
      parentId ? list.map((c) => (c.commentId === parentId ? { ...c, replies: [...c.replies, mine] } : c)) : [mine, ...list],
    );
  }

  function deleteComment(target: PublicComment) {
    startDelete(async () => {
      const result = await DeleteOwnComment({ kind, commentId: target.commentId });
      if (!result.success) return void toast.error(result.error);
      setToDelete(null);
      setThreads((list) =>
        list
          .filter((c) => c.commentId !== target.commentId)
          .map((c) => ({ ...c, replies: c.replies.filter((r) => r.commentId !== target.commentId) }))
          .filter((c) => !c.hidden || c.replies.length > 0),
      );
      toast.success("Commentaire supprimé");
      router.refresh();
    });
  }

  function toggleLike() {
    if (!user) return setPrompt(true);
    startTransition(async () => {
      setLike({ liked: !like.liked, likes: like.likes + (like.liked ? -1 : 1) });
      const result = await (kind === "watch" ? toggleWatchLike(id) : toggleReadLike(id));
      if (!result.success) toast.error(result.error);
    });
  }

  const rows = [
    { label: "Vues", icon: ChartBarFillIcon, value: engagement.views },
    { label: "J'aime", icon: HeartFillIcon, value: like.likes, onClick: toggleLike, active: like.liked },
    { label: "Commentaires", icon: Comment2FillIcon, value: commentCount },
    { label: "Partages", icon: Share3FillIcon, value: engagement.shares },
  ];
  const signInCta = (
    <ButtonLink href={loginHref(pathname)} icon={UserAdd2FillIcon}>
      Se connecter pour aimer et commenter
    </ButtonLink>
  );

  return (
    <div className="flex flex-col gap-[3rem] lg:flex-row lg:items-start">
      <dl className="flex w-full shrink-0 flex-col lg:w-[40rem]">
        {rows.map((row, i) => {
          const Icon = row.icon;
          const value = (
            <span className="flex items-center gap-4 type-body font-medium text-ink">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={String(!!row.active)}
                  className={cn("flex", row.active ? "text-liked" : "text-subtle")}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE_POP }}
                >
                  <Icon />
                </motion.span>
              </AnimatePresence>
              {row.value.toLocaleString("fr-FR")}
            </span>
          );
          return (
            <div key={row.label} className={cn("flex items-center justify-between py-[1.5rem] first:pt-0", i > 0 && "border-t border-divider")}>
              <dt className="type-body font-medium text-faint">{row.label}</dt>
              <dd>
                {row.onClick ? (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={row.onClick}
                    aria-pressed={!!row.active}
                    aria-label={row.active ? `Ne plus aimer « ${title} »` : `Aimer « ${title} »`}
                    className="cursor-pointer"
                  >
                    {value}
                  </motion.button>
                ) : (
                  value
                )}
              </dd>
            </div>
          );
        })}
      </dl>

      <section aria-labelledby="comments-title" className="flex min-w-0 flex-1 flex-col gap-[1.5rem]">
        {user && <CommentForm kind={kind} itemId={id} onPosted={(c) => addComment(c)} />}
        {threads.length === 0 ? (
          <div className={cn("flex flex-col gap-8", !user && "items-center gap-[4.5rem]")}>
            <h2 id="comments-title" className="w-full type-title font-bold text-ink">
              Commentaires
            </h2>
            <div className="flex flex-col items-center gap-[1.5rem] text-center">
              <Comment2FillIcon size={45} className="text-faint" />
              <p className="type-body font-medium text-faint">Pas encore de commentaire</p>
              {!user && signInCta}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <h2 id="comments-title" className="type-title font-bold text-ink">
              Commentaires
            </h2>
            {!user && <div className="self-start">{signInCta}</div>}
            <ol className="flex flex-col gap-[1.5rem]">
              <AnimatePresence initial={false}>
                {threads.map((comment) => (
                  <CommentEntry
                    key={comment.commentId}
                    comment={comment}
                    onReply={user && !comment.hidden ? () => setReplyTo(replyTo === comment.commentId ? null : comment.commentId) : undefined}
                    onDelete={setToDelete}
                  >
                    {(comment.replies.length > 0 || replyTo === comment.commentId) && (
                      <div className="ml-[1.5rem] flex flex-col gap-[1.5rem] border-l-2 border-divider pl-[1.5rem]">
                        {comment.replies.length > 0 && (
                          <ol className="flex flex-col gap-[1.5rem]">
                            <AnimatePresence initial={false}>
                              {comment.replies.map((reply) => (
                                <CommentEntry key={reply.commentId} comment={reply} onDelete={setToDelete} />
                              ))}
                            </AnimatePresence>
                          </ol>
                        )}
                        <AnimatePresence initial={false}>
                          {replyTo === comment.commentId && (
                            <motion.div
                              key="reply"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3, ease: EASE_OUT }}
                              className="overflow-hidden"
                            >
                              <CommentForm
                                kind={kind}
                                itemId={id}
                                parentId={comment.commentId}
                                onCancel={() => setReplyTo(null)}
                                onPosted={(c) => {
                                  addComment(c, comment.commentId);
                                  setReplyTo(null);
                                }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </CommentEntry>
                ))}
              </AnimatePresence>
            </ol>
          </div>
        )}
      </section>
      <Modal
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Supprimer ce commentaire ?"
        description={
          toDelete && toDelete.replies.length > 0
            ? `Il sera supprimé définitivement, avec ${toDelete.replies.length === 1 ? "sa réponse" : `ses ${toDelete.replies.length} réponses`}.`
            : "Il sera supprimé définitivement."
        }
      >
        <ModalActions>
          <ModalBackButton>Annuler</ModalBackButton>
          <div className="lg:w-[32rem]">
            <Button size="lg" className="w-full" disabled={deleting} onClick={() => toDelete && deleteComment(toDelete)}>
              Supprimer
            </Button>
          </div>
        </ModalActions>
      </Modal>
      <SignInPrompt open={prompt} onOpenChange={setPrompt} reason="react" />
    </div>
  );
}

// Figma text field (153:13463): 200px, #f8f8f8, 5px radius; focused: #163300 border and a 2px #cff3b7 ring.
// The "Comment" button (lime, send icon) appears once there is text. As a reply form (parentId):
// 100px tall, focused on open, with "Annuler".
function CommentForm({
  kind,
  itemId,
  parentId,
  onPosted,
  onCancel,
}: {
  kind: "read" | "watch";
  itemId: string;
  parentId?: string;
  onPosted: (comment: PublicComment) => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const trimmed = text.trim();
  const reply = !!parentId;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (trimmed.length < 3) return void toast.error("Le commentaire doit contenir au moins 3 caractères.");
    startTransition(async () => {
      const result = await PostComment({ kind, itemId, comment: trimmed, parentId });
      if (!result.success) return void toast.error(result.error);
      onPosted({ commentId: result.commentId, comment: trimmed, createdAt: new Date().toISOString(), author: "", mine: true, hidden: false, replies: [] });
      setText("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col items-end gap-[1.5rem]">
      <label
        className={cn(
          "flex w-full flex-col gap-[0.4rem] rounded-card border border-transparent bg-field px-[1.4rem] py-[1.2rem] outline-2 outline-transparent transition-colors focus-within:border-primary-base focus-within:outline-focus-ring",
          reply ? "h-[10rem]" : "h-[20rem]",
        )}
      >
        <span className="text-[1rem] leading-none tracking-[-0.03rem] text-subtle">{reply ? "Votre réponse" : "Partagez vos impressions"}</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          autoFocus={reply}
          className="w-full flex-1 resize-none bg-transparent type-body text-ink outline-none"
        />
      </label>
      <div className="flex items-center gap-4">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={pending}>
            Annuler
          </Button>
        )}
        <AnimatePresence initial={false}>
          {trimmed && (
            <motion.span
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
            >
              <Button type="submit" icon={SendFillIcon} disabled={pending}>
                {pending ? "Envoi…" : reply ? "Répondre" : "Commenter"}
              </Button>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}

// One comment: the author (person icon, Medium 14) over the #f9f9f9 bubble, then small text actions.
// A hidden comment keeps only an italic placeholder bubble. Replies (children) sit underneath.
function CommentEntry({
  comment,
  onReply,
  onDelete,
  children,
}: {
  comment: PublicComment;
  onReply?: () => void;
  onDelete: (comment: PublicComment) => void;
  children?: React.ReactNode;
}) {
  const action = "cursor-pointer type-body font-medium text-faint transition-colors hover:text-ink";
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
      className="flex flex-col gap-4"
    >
      {comment.hidden ? (
        <p className="ml-[1.5rem] rounded-card bg-canvas p-4 type-body text-faint italic">Commentaire masqué par la modération</p>
      ) : (
        <>
          <span className="flex items-center gap-[0.5rem] type-body font-medium text-ink">
            <User4FillIcon className="shrink-0" />
            {comment.author}
          </span>
          <p className="ml-[1.5rem] rounded-card bg-canvas p-4 type-body break-words text-ink">{comment.comment}</p>
          {(onReply || comment.mine) && (
            <div className="ml-[1.5rem] flex items-center gap-[1.5rem]">
              {onReply && (
                <button type="button" onClick={onReply} className={action}>
                  Répondre
                </button>
              )}
              {comment.mine && (
                <button type="button" onClick={() => onDelete(comment)} className={action}>
                  Supprimer
                </button>
              )}
            </div>
          )}
        </>
      )}
      {children}
    </motion.li>
  );
}
