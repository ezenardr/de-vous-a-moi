"use client";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleReadLike, toggleWatchLike } from "@/action/engagement";
import { AddReadComment } from "@/action/reads";
import { AddWatchComment } from "@/action/watch";
import { Button, ButtonLink } from "@/components/ds/Button";
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
import type { ArticleComment, ArticleEngagement as Engagement } from "@/server/queries/reads";

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
  const [comments, setComments] = useState(engagement.comments);

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
    { label: "Commentaires", icon: Comment2FillIcon, value: comments.length },
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
        {user && <CommentForm kind={kind} id={id} author={user} onPosted={(c) => setComments((list) => [c, ...list])} />}
        {comments.length === 0 ? (
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
                {comments.map((comment) => (
                  <motion.li
                    key={comment.commentId}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: EASE_OUT }}
                    className="flex flex-col gap-4"
                  >
                    <span className="flex items-center gap-[0.5rem] type-body font-medium text-ink">
                      <User4FillIcon className="shrink-0" />
                      {comment.author}
                    </span>
                    <p className="ml-[1.5rem] rounded-card bg-canvas p-4 type-body break-words text-ink">{comment.comment}</p>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
          </div>
        )}
      </section>
      <SignInPrompt open={prompt} onOpenChange={setPrompt} reason="react" />
    </div>
  );
}

// Figma text field (153:13463): 200px, #f8f8f8, 5px radius; focused: #163300 border and a 2px #cff3b7 ring.
// The "Comment" button (lime, send icon) appears once there is text.
function CommentForm({
  kind,
  id,
  author,
  onPosted,
}: {
  kind: "read" | "watch";
  id: string;
  author: { firstName: string; lastName: string };
  onPosted: (comment: ArticleComment) => void;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const trimmed = text.trim();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (trimmed.length < 3) return void toast.error("Le commentaire doit contenir au moins 3 caractères.");
    startTransition(async () => {
      const body = { comment: trimmed };
      const result = await (kind === "watch"
        ? AddWatchComment({ body: { ...body, watchId: id } })
        : AddReadComment({ body: { ...body, readId: id } }));
      if (!result.success) return void toast.error(result.error);
      onPosted({
        commentId: crypto.randomUUID(),
        comment: trimmed,
        createdAt: new Date().toISOString(),
        author: `${author.firstName} ${author.lastName ? `${author.lastName[0]}.` : ""}`.trim(),
      });
      setText("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col items-end gap-[1.5rem]">
      <label className="flex h-[20rem] w-full flex-col gap-[0.4rem] rounded-card border border-transparent bg-field px-[1.4rem] py-[1.2rem] outline-2 outline-transparent transition-colors focus-within:border-primary-base focus-within:outline-focus-ring">
        <span className="text-[1rem] leading-none tracking-[-0.03rem] text-subtle">Partagez vos impressions</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          className="w-full flex-1 resize-none bg-transparent type-body text-ink outline-none"
        />
      </label>
      <AnimatePresence initial={false}>
        {trimmed && (
          <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
          >
            <Button type="submit" icon={SendFillIcon} disabled={pending}>
              {pending ? "Envoi…" : "Commenter"}
            </Button>
          </motion.span>
        )}
      </AnimatePresence>
    </form>
  );
}
