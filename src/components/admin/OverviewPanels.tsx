import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthorChip } from "@/components/ds/AuthorChip";
import { Badge } from "@/components/ds/Badge";
import { RightLineIcon } from "@/components/icons/mingcute";
import { formatDateTime } from "@/lib/formatDate";
import { ROLE_LABELS } from "@/lib/role/labels";
import { slugify } from "@/lib/Slugify";
import { timeAgo } from "@/lib/timeAgo";
import type { AdminContentKind, AdminOverview } from "@/server/queries/admin";

const fr = (n: number) => n.toLocaleString("fr-FR");
const publicHref = (kind: AdminContentKind, title: string, id: string) => `/${kind === "read" ? "reads" : "watches"}/${slugify(title, id)}`;
const KIND_LABEL: Record<AdminContentKind, string> = { read: "Article", watch: "Vidéo" };

// A bordered overview card: Bold 16 title, an optional "Voir tout" link, then its rows (or a quiet empty line).
function Panel({ title, href, empty, children }: { title: string; href?: string; empty: string; children: ReactNode[] }) {
  return (
    <section className="flex min-w-0 flex-col gap-6 rounded-panel border-[1.5px] border-canvas p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="type-body-lg font-bold text-heading">{title}</h2>
        {href && (
          <Link href={href} className="group/link flex items-center gap-[0.3rem] type-body font-bold text-primary-base">
            Voir tout
            <RightLineIcon size={18} className="text-cat-tech transition-transform duration-300 group-hover/link:translate-x-[0.3rem]" />
          </Link>
        )}
      </div>
      {children.length === 0 ? <p className="py-6 text-center type-body text-faint">{empty}</p> : <ul className="flex flex-col divide-y divide-canvas">{children}</ul>}
    </section>
  );
}

function Thumb({ src }: { src: string }) {
  return (
    <span className="relative h-[4.4rem] w-[6.6rem] shrink-0 overflow-hidden rounded-card bg-field">
      <Image src={src} alt="" fill sizes="66px" className="object-cover" />
    </span>
  );
}

const row = "flex min-w-0 items-center gap-4 py-[1.2rem] first:pt-0 last:pb-0";

export function TopContentPanel({ items }: { items: AdminOverview["top"] }) {
  return (
    <Panel title="Les plus vus" empty="Aucun contenu publié.">
      {items.map((item, i) => (
        <li key={`${item.kind}-${item.id}`} className={row}>
          <span className="w-[1.6rem] shrink-0 type-body font-bold text-faint tabular-nums">{i + 1}</span>
          <Thumb src={item.imageUrl} />
          <span className="flex min-w-0 flex-1 flex-col">
            <Link href={publicHref(item.kind, item.title, item.id)} className="truncate type-body font-medium text-ink hover:underline">
              {item.title}
            </Link>
            <span className="type-body text-faint">
              {KIND_LABEL[item.kind]} · {fr(item.likes)} j&apos;aime
            </span>
          </span>
          <span className="shrink-0 type-body font-bold text-primary-base tabular-nums">{fr(item.views)} vues</span>
        </li>
      ))}
    </Panel>
  );
}

export function ScheduledPanel({ items }: { items: AdminOverview["scheduled"] }) {
  return (
    <Panel title="Programmés" empty="Rien de programmé pour le moment.">
      {items.map((item) => (
        <li key={`${item.kind}-${item.id}`} className={row}>
          <Thumb src={item.imageUrl} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate type-body font-medium text-ink">{item.title}</span>
            <span className="type-body text-faint">
              {KIND_LABEL[item.kind]} · {formatDateTime(item.publishedAt)}
            </span>
          </span>
        </li>
      ))}
    </Panel>
  );
}

export function RecentCommentsPanel({ comments, href }: { comments: AdminOverview["comments"]; href?: string }) {
  return (
    <Panel title="Derniers commentaires" href={href} empty="Aucun commentaire.">
      {comments.map((c) => (
        <li key={`${c.kind}-${c.id}`} className="flex min-w-0 flex-col gap-[0.6rem] py-[1.2rem] first:pt-0 last:pb-0">
          <span className="flex items-center justify-between gap-4">
            <AuthorChip author={c.author} variant="page" />
            <span className="shrink-0 type-body text-faint">il y a {timeAgo(c.createdAt)}</span>
          </span>
          <p className="line-clamp-2 type-body text-subtle">{c.comment}</p>
          <Link href={publicHref(c.kind, c.item.title, c.item.id)} className="truncate type-body font-medium text-primary-base hover:underline">
            {KIND_LABEL[c.kind]} · {c.item.title}
          </Link>
        </li>
      ))}
    </Panel>
  );
}

export function RecentUsersPanel({ users, href }: { users: AdminOverview["users"]; href?: string }) {
  return (
    <Panel title="Nouveaux inscrits" href={href} empty="Aucun inscrit.">
      {users.map((u) => (
        <li key={u.userId} className={row}>
          <span className="min-w-0 flex-1">
            <AuthorChip author={u} variant="page" />
          </span>
          {u.role !== "1" && <Badge className="hidden sm:inline-flex">{ROLE_LABELS[u.role]}</Badge>}
          <span className="shrink-0 type-body text-faint">il y a {timeAgo(u.createdAt)}</span>
        </li>
      ))}
    </Panel>
  );
}
