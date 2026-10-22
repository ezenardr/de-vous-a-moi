import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/server/db";
import { toIso } from "./shared";

// Site-wide queries for /admin. Callers must have checked Actions.admin: these return personal data
// (names, emails) that never reach public pages.

export type AdminRole = "1" | "2" | "3" | "4";
export type AdminContentKind = "read" | "watch";

export type AdminTotals = {
  users: number;
  newUsers: number;
  subscribers: number;
  newSubscribers: number;
  views: number;
  likes: number;
  newLikes: number;
  comments: number;
  newComments: number;
};

export type AdminTopItem = { kind: AdminContentKind; id: string; title: string; imageUrl: string; views: number; likes: number };
export type AdminScheduledItem = { kind: AdminContentKind; id: string; title: string; imageUrl: string; publishedAt: string };
export type AdminRecentComment = {
  kind: AdminContentKind;
  id: string;
  comment: string;
  createdAt: string;
  author: { firstName: string; lastName: string; profileImageUrl: string | null };
  item: { id: string; title: string };
};
export type AdminRecentUser = {
  userId: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  role: AdminRole;
  createdAt: string;
};

export type AdminOverview = {
  totals: AdminTotals;
  top: AdminTopItem[];
  scheduled: AdminScheduledItem[];
  comments: AdminRecentComment[];
  users: AdminRecentUser[];
};

const RECENT = sql`now() - interval '30 days'`;
const isPublic = (table: "reads" | "watches") =>
  sql.raw(`${table}.archived = false and (${table}.published_at is null or ${table}.published_at <= now())`);

// Raw rows: pg returns bigint counts as strings and timestamps as Dates.
type Row = Record<string, unknown>;
const num = (value: unknown) => Number(value ?? 0);
const iso = (value: unknown) => toIso(value instanceof Date ? value : value ? new Date(String(value)) : null) ?? new Date(0).toISOString();
const rows = async (query: ReturnType<typeof sql>) => (await db.execute(query)).rows as Row[];

// The /admin overview: headline numbers with their last-30-days share, then four short lists.
// Five independent queries, sent in parallel.
export async function getAdminOverview(): Promise<AdminOverview> {
  const [totalsRows, topRows, scheduledRows, commentRows, userRows] = await Promise.all([
    rows(sql`
      select
        (select count(*) from users) as users,
        (select count(*) from users where created_at >= ${RECENT}) as new_users,
        (select count(*) from newsletter_subscribers where status = 'active') as subscribers,
        (select count(*) from newsletter_subscribers where status = 'active' and created_at >= ${RECENT}) as new_subscribers,
        (select coalesce(sum(view_count), 0) from reads) + (select coalesce(sum(view_count), 0) from watches) as views,
        (select count(*) from read_likes) + (select count(*) from watch_likes) as likes,
        (select count(*) from read_likes where created_at >= ${RECENT})
          + (select count(*) from watch_likes where created_at >= ${RECENT}) as new_likes,
        (select count(*) from read_comments) + (select count(*) from watch_comments) as comments,
        (select count(*) from read_comments where created_at >= ${RECENT})
          + (select count(*) from watch_comments where created_at >= ${RECENT}) as new_comments
    `),
    rows(sql`
      select * from (
        select 'read' as kind, read_id as id, title, image_url, view_count as views,
          (select count(*) from read_likes l where l.read_id = reads.read_id) as likes
        from reads where ${isPublic("reads")}
        union all
        select 'watch', watch_id, title, image_url, view_count,
          (select count(*) from watch_likes l where l.watch_id = watches.watch_id)
        from watches where ${isPublic("watches")}
      ) items
      order by views desc, likes desc
      limit 5
    `),
    rows(sql`
      select * from (
        select 'read' as kind, read_id as id, title, image_url, published_at from reads
        where archived = false and published_at > now()
        union all
        select 'watch', watch_id, title, image_url, published_at from watches
        where archived = false and published_at > now()
      ) items
      order by published_at
      limit 5
    `),
    rows(sql`
      select * from (
        select 'read' as kind, c.read_comment_id as id, c.comment, c.created_at, c.read_id as item_id, r.title as item_title,
          u.first_name, u.last_name, u.profile_image_url
        from read_comments c join reads r on r.read_id = c.read_id join users u on u.user_id = c.user_id
        union all
        select 'watch', c.watch_comment_id, c.comment, c.created_at, c.watch_id, w.title,
          u.first_name, u.last_name, u.profile_image_url
        from watch_comments c join watches w on w.watch_id = c.watch_id join users u on u.user_id = c.user_id
      ) items
      order by created_at desc nulls last
      limit 5
    `),
    rows(sql`
      select user_id, first_name, last_name, profile_image_url, role, created_at
      from users order by created_at desc limit 5
    `),
  ]);

  const t = totalsRows[0] ?? {};
  return {
    totals: {
      users: num(t.users),
      newUsers: num(t.new_users),
      subscribers: num(t.subscribers),
      newSubscribers: num(t.new_subscribers),
      views: num(t.views),
      likes: num(t.likes),
      newLikes: num(t.new_likes),
      comments: num(t.comments),
      newComments: num(t.new_comments),
    },
    top: topRows.map((r) => ({
      kind: r.kind as AdminContentKind,
      id: String(r.id),
      title: String(r.title),
      imageUrl: String(r.image_url),
      views: num(r.views),
      likes: num(r.likes),
    })),
    scheduled: scheduledRows.map((r) => ({
      kind: r.kind as AdminContentKind,
      id: String(r.id),
      title: String(r.title),
      imageUrl: String(r.image_url),
      publishedAt: iso(r.published_at),
    })),
    comments: commentRows.map((r) => ({
      kind: r.kind as AdminContentKind,
      id: String(r.id),
      comment: String(r.comment),
      createdAt: iso(r.created_at),
      author: { firstName: String(r.first_name), lastName: String(r.last_name), profileImageUrl: (r.profile_image_url as string | null) ?? null },
      item: { id: String(r.item_id), title: String(r.item_title) },
    })),
    users: userRows.map((r) => ({
      userId: String(r.user_id),
      firstName: String(r.first_name),
      lastName: String(r.last_name),
      profileImageUrl: (r.profile_image_url as string | null) ?? null,
      role: ((r.role as AdminRole | null) ?? "1") as AdminRole,
      createdAt: iso(r.created_at),
    })),
  };
}

// ---------------------------------------------------------------------------------------------
// Contenus: every read and video from every author, with its status, featured flag and counts.

export type AdminContentStatus = "published" | "scheduled" | "archived";
export type AdminContentItem = {
  kind: AdminContentKind;
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  author: string;
  status: AdminContentStatus;
  publishedAt: string;
  featured: boolean;
  views: number;
  likes: number;
  comments: number;
};

function toContentItem(kind: AdminContentKind, r: Row): AdminContentItem {
  const publishedAt = iso(r.published_at);
  return {
    kind,
    id: String(r.id),
    title: String(r.title),
    imageUrl: String(r.image_url),
    category: String(r.category),
    author: `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim(),
    status: r.archived ? "archived" : new Date(publishedAt).getTime() > Date.now() ? "scheduled" : "published",
    publishedAt,
    featured: Boolean(r.featured),
    views: num(r.views),
    likes: num(r.likes),
    comments: num(r.comments),
  };
}

export async function getAdminContent(): Promise<{ reads: AdminContentItem[]; watches: AdminContentItem[] }> {
  const [readRows, watchRows] = await Promise.all([
    rows(sql`
      select r.read_id as id, r.title, r.image_url, r.category, r.archived, r.featured, r.view_count as views,
        coalesce(r.published_at, r.created_at) as published_at, u.first_name, u.last_name,
        (select count(*) from read_likes l where l.read_id = r.read_id) as likes,
        (select count(*) from read_comments c where c.read_id = r.read_id) as comments
      from reads r left join users u on u.user_id = r.user_id
      order by coalesce(r.published_at, r.created_at) desc
    `),
    rows(sql`
      select w.watch_id as id, w.title, w.image_url, w.category, w.archived, w.featured, w.view_count as views,
        coalesce(w.published_at, w.created_at) as published_at, u.first_name, u.last_name,
        (select count(*) from watch_likes l where l.watch_id = w.watch_id) as likes,
        (select count(*) from watch_comments c where c.watch_id = w.watch_id) as comments
      from watches w left join users u on u.user_id = w.user_id
      order by coalesce(w.published_at, w.created_at) desc
    `),
  ]);
  return { reads: readRows.map((r) => toContentItem("read", r)), watches: watchRows.map((r) => toContentItem("watch", r)) };
}

// ---------------------------------------------------------------------------------------------
// Commentaires: every comment on reads and videos, newest first, with its thread position.

export type AdminComment = {
  kind: AdminContentKind;
  id: string;
  comment: string;
  createdAt: string;
  hidden: boolean;
  author: { firstName: string; lastName: string; profileImageUrl: string | null };
  item: { id: string; title: string };
  parent: { id: string; author: string } | null;
  replyCount: number;
};

export async function getAdminComments(): Promise<AdminComment[]> {
  const commentRows = await rows(sql`
    select * from (
      select 'read' as kind, c.read_comment_id as id, c.comment, c.created_at, c.hidden_at, c.parent_id,
        c.read_id as item_id, r.title as item_title, u.first_name, u.last_name, u.profile_image_url,
        pu.first_name as parent_first_name, pu.last_name as parent_last_name,
        (select count(*) from read_comments x where x.parent_id = c.read_comment_id) as replies
      from read_comments c
      join reads r on r.read_id = c.read_id
      left join users u on u.user_id = c.user_id
      left join read_comments p on p.read_comment_id = c.parent_id
      left join users pu on pu.user_id = p.user_id
      union all
      select 'watch', c.watch_comment_id, c.comment, c.created_at, c.hidden_at, c.parent_id,
        c.watch_id, w.title, u.first_name, u.last_name, u.profile_image_url,
        pu.first_name, pu.last_name,
        (select count(*) from watch_comments x where x.parent_id = c.watch_comment_id)
      from watch_comments c
      join watches w on w.watch_id = c.watch_id
      left join users u on u.user_id = c.user_id
      left join watch_comments p on p.watch_comment_id = c.parent_id
      left join users pu on pu.user_id = p.user_id
    ) items
    order by created_at desc nulls last
    limit 500
  `);
  return commentRows.map((r) => ({
    kind: r.kind as AdminContentKind,
    id: String(r.id),
    comment: String(r.comment),
    createdAt: iso(r.created_at),
    hidden: !!r.hidden_at,
    author: { firstName: String(r.first_name ?? ""), lastName: String(r.last_name ?? ""), profileImageUrl: (r.profile_image_url as string | null) ?? null },
    item: { id: String(r.item_id), title: String(r.item_title) },
    parent: r.parent_id ? { id: String(r.parent_id), author: `${r.parent_first_name ?? ""} ${r.parent_last_name ?? ""}`.trim() } : null,
    replyCount: num(r.replies),
  }));
}

// ---------------------------------------------------------------------------------------------
// Utilisateurs: every account, newest first, with its role, newsletter status and activity.

export type AdminUser = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string | null;
  role: AdminRole;
  createdAt: string;
  subscribed: boolean;
  activity: { comments: number; likes: number; saves: number; published: number };
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  const userRows = await rows(sql`
    select u.user_id, u.first_name, u.last_name, u.email, u.profile_image_url, u.role, u.created_at,
      exists(select 1 from newsletter_subscribers n where n.user_id = u.user_id and n.status = 'active') as subscribed,
      (select count(*) from read_comments c where c.user_id = u.user_id)
        + (select count(*) from watch_comments c where c.user_id = u.user_id) as comments,
      (select count(*) from read_likes l where l.user_id = u.user_id)
        + (select count(*) from watch_likes l where l.user_id = u.user_id) as likes,
      (select count(*) from favorites f where f.user_id = u.user_id)
        + (select count(*) from watch_favorites f where f.user_id = u.user_id) as saves,
      (select count(*) from reads r where r.user_id = u.user_id)
        + (select count(*) from watches w where w.user_id = u.user_id) as published
    from users u
    order by u.created_at desc
  `);
  return userRows.map((r) => ({
    userId: String(r.user_id),
    firstName: String(r.first_name),
    lastName: String(r.last_name),
    email: String(r.email),
    profileImageUrl: (r.profile_image_url as string | null) ?? null,
    role: ((r.role as AdminRole | null) ?? "1") as AdminRole,
    createdAt: iso(r.created_at),
    subscribed: Boolean(r.subscribed),
    activity: { comments: num(r.comments), likes: num(r.likes), saves: num(r.saves), published: num(r.published) },
  }));
}

// ---------------------------------------------------------------------------------------------
// Newsletter: the list, and the public reads/videos a newsletter can feature.

export type AdminSubscriber = { email: string; status: "active" | "unsubscribed"; createdAt: string; updatedAt: string; account: string | null };

export async function getAdminSubscribers(): Promise<AdminSubscriber[]> {
  const subscriberRows = await rows(sql`
    select n.email, n.status, n.created_at, n.updated_at, u.first_name, u.last_name
    from newsletter_subscribers n left join users u on u.user_id = n.user_id
    order by n.status = 'active' desc, n.created_at desc
  `);
  return subscriberRows.map((r) => ({
    email: String(r.email),
    status: r.status === "active" ? "active" : "unsubscribed",
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
    account: r.first_name ? `${r.first_name} ${r.last_name ?? ""}`.trim() : null,
  }));
}

export type PickableItem = { kind: AdminContentKind; id: string; title: string; imageUrl: string; publishedAt: string };

export async function getNewsletterPickable(): Promise<PickableItem[]> {
  const itemRows = await rows(sql`
    select * from (
      select 'read' as kind, read_id as id, title, image_url, coalesce(published_at, created_at) as published_at
      from reads where ${isPublic("reads")}
      union all
      select 'watch', watch_id, title, image_url, coalesce(published_at, created_at)
      from watches where ${isPublic("watches")}
    ) items
    order by published_at desc
    limit 100
  `);
  return itemRows.map((r) => ({ kind: r.kind as AdminContentKind, id: String(r.id), title: String(r.title), imageUrl: String(r.image_url), publishedAt: iso(r.published_at) }));
}
