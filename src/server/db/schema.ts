// Mirrors the live tables created by the AdonisJS migrations in api.messarae.com,
// verified with `drizzle-kit pull` against production on 2026-10-21.
// Constraint names match Knex's naming so generated migrations never touch existing constraints.
// Do not change existing columns without a reviewed, additive migration: the site is live.
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const timestamptz = (name: string) => timestamp(name, { withTimezone: true });

export const users = pgTable(
  "users",
  {
    userId: uuid("user_id").primaryKey(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    profileImageUrl: text("profile_image_url"),
    imageFileId: text("image_file_id"),
    role: text("role").$type<"1" | "2" | "3" | "4">().default("1"),
    newRead: boolean("new_read").notNull().default(true),
    newWatch: boolean("new_watch").notNull().default(true),
    newsletter: boolean("newsletter").notNull().default(true),
    accountActivity: boolean("account_activity").notNull().default(true),
    resendCount: integer("resend_count").default(0),
    lastResendAt: timestamptz("last_resend_at"),
    createdAt: timestamptz("created_at").notNull(),
    updatedAt: timestamptz("updated_at"),
  },
  (t) => [
    unique("users_email_unique").on(t.email),
    check("users_role_check", sql`role = ANY (ARRAY['1'::text, '2'::text, '3'::text, '4'::text])`),
  ],
);

// Adonis access tokens. Unused by the monolith; dropped only after the API is decommissioned.
export const authAccessTokens = pgTable(
  "auth_access_tokens",
  {
    id: serial("id").primaryKey(),
    tokenableId: uuid("tokenable_id").notNull(),
    type: varchar("type", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    hash: varchar("hash", { length: 255 }).notNull(),
    abilities: text("abilities").notNull(),
    createdAt: timestamptz("created_at"),
    updatedAt: timestamptz("updated_at"),
    lastUsedAt: timestamptz("last_used_at"),
    expiresAt: timestamptz("expires_at"),
  },
  (t) => [
    foreignKey({
      name: "auth_access_tokens_tokenable_id_foreign",
      columns: [t.tokenableId],
      foreignColumns: [users.userId],
    }).onDelete("cascade"),
  ],
);

export const readDrafts = pgTable(
  "read_drafts",
  {
    readDraftId: uuid("read_draft_id").primaryKey(),
    userId: uuid("user_id"),
    title: varchar("title", { length: 255 }),
    description: varchar("description", { length: 255 }),
    imageUrl: text("image_url"),
    imageFileId: text("image_file_id"),
    category: text("category"),
    content: text("content"),
    createdAt: timestamptz("created_at"),
    updatedAt: timestamptz("updated_at"),
  },
  (t) => [
    foreignKey({
      name: "read_drafts_user_id_foreign",
      columns: [t.userId],
      foreignColumns: [users.userId],
    }).onDelete("cascade"),
  ],
);

export const reads = pgTable(
  "reads",
  {
    readId: uuid("read_id").primaryKey(),
    userId: uuid("user_id"),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    imageUrl: text("image_url").notNull(),
    imageFileId: text("image_file_id").notNull(),
    category: text("category").notNull(),
    content: text("content").notNull(),
    featured: boolean("featured").default(false),
    archived: boolean("archived").default(false),
    createdAt: timestamptz("created_at"),
    updatedAt: timestamptz("updated_at"),
    // Added by the monolith (migration 0001). Counters: one view per browser session, one share per share action.
    viewCount: integer("view_count").notNull().default(0),
    shareCount: integer("share_count").notNull().default(0),
    // Migration 0005: scheduled publishing. Null = public since created_at (everything before 0005);
    // a future date keeps the read hidden until then.
    publishedAt: timestamptz("published_at"),
  },
  (t) => [
    foreignKey({
      name: "reads_user_id_foreign",
      columns: [t.userId],
      foreignColumns: [users.userId],
    }).onDelete("cascade"),
  ],
);

export const readComments = pgTable(
  "read_comments",
  {
    readCommentId: uuid("read_comment_id").primaryKey(),
    readId: uuid("read_id"),
    userId: uuid("user_id"),
    comment: text("comment").notNull(),
    createdAt: timestamptz("created_at"),
    updatedAt: timestamptz("updated_at"),
    // Migration 0006: threads (one level: a reply's parent is always a top-level comment) and moderation.
    parentId: uuid("parent_id"),
    hiddenAt: timestamptz("hidden_at"),
    hiddenBy: uuid("hidden_by"),
  },
  (t) => [
    foreignKey({
      name: "read_comments_parent_id_fk",
      columns: [t.parentId],
      foreignColumns: [t.readCommentId],
    }).onDelete("cascade"),
    foreignKey({
      name: "read_comments_hidden_by_fk",
      columns: [t.hiddenBy],
      foreignColumns: [users.userId],
    }).onDelete("set null"),
    index("read_comments_parent_id_idx").on(t.parentId),
    foreignKey({
      name: "read_comments_read_id_foreign",
      columns: [t.readId],
      foreignColumns: [reads.readId],
    }).onDelete("cascade"),
    foreignKey({
      name: "read_comments_user_id_foreign",
      columns: [t.userId],
      foreignColumns: [users.userId],
    }).onDelete("cascade"),
    index("read_comments_read_id_idx").on(t.readId),
  ],
);

// Added by the monolith (migration 0001): one like per user per read.
export const readLikes = pgTable(
  "read_likes",
  {
    readId: uuid("read_id")
      .notNull()
      .references(() => reads.readId, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ name: "read_likes_pkey", columns: [t.readId, t.userId] })],
);

export const favorites = pgTable(
  "favorites",
  {
    favoriteId: uuid("favorite_id").primaryKey(),
    userId: uuid("user_id"),
    readId: uuid("read_id"),
    createdAt: timestamptz("created_at"),
    updatedAt: timestamptz("updated_at"),
  },
  (t) => [
    foreignKey({
      name: "favorites_user_id_foreign",
      columns: [t.userId],
      foreignColumns: [users.userId],
    }).onDelete("cascade"),
    foreignKey({
      name: "favorites_read_id_foreign",
      columns: [t.readId],
      foreignColumns: [reads.readId],
    }).onDelete("cascade"),
    unique("favorites_user_id_read_id_unique").on(t.userId, t.readId),
  ],
);

export const watches = pgTable(
  "watches",
  {
    watchId: uuid("watch_id").primaryKey(),
    userId: uuid("user_id"),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    imageUrl: text("image_url").notNull(),
    imageFileId: text("image_file_id").notNull(),
    category: text("category").notNull(),
    videoUrl: text("video_url").notNull(),
    featured: boolean("featured").default(false),
    archived: boolean("archived").default(false),
    createdAt: timestamptz("created_at"),
    updatedAt: timestamptz("updated_at"),
    // Added by the monolith (migration 0002). Duration comes from YouTube; null until fetched.
    viewCount: integer("view_count").notNull().default(0),
    shareCount: integer("share_count").notNull().default(0),
    durationSeconds: integer("duration_seconds"),
    // Migration 0005: scheduled publishing, as for reads.
    publishedAt: timestamptz("published_at"),
  },
  (t) => [
    foreignKey({
      name: "watches_user_id_foreign",
      columns: [t.userId],
      foreignColumns: [users.userId],
    }).onDelete("cascade"),
  ],
);

export const watchComments = pgTable(
  "watch_comments",
  {
    watchCommentId: uuid("watch_comment_id").primaryKey(),
    watchId: uuid("watch_id"),
    userId: uuid("user_id"),
    comment: text("comment").notNull(),
    createdAt: timestamptz("created_at"),
    updatedAt: timestamptz("updated_at"),
    // Migration 0006: threads (one level: a reply's parent is always a top-level comment) and moderation.
    parentId: uuid("parent_id"),
    hiddenAt: timestamptz("hidden_at"),
    hiddenBy: uuid("hidden_by"),
  },
  (t) => [
    foreignKey({
      name: "watch_comments_parent_id_fk",
      columns: [t.parentId],
      foreignColumns: [t.watchCommentId],
    }).onDelete("cascade"),
    foreignKey({
      name: "watch_comments_hidden_by_fk",
      columns: [t.hiddenBy],
      foreignColumns: [users.userId],
    }).onDelete("set null"),
    index("watch_comments_parent_id_idx").on(t.parentId),
    foreignKey({
      name: "watch_comments_watch_id_foreign",
      columns: [t.watchId],
      foreignColumns: [watches.watchId],
    }).onDelete("cascade"),
    foreignKey({
      name: "watch_comments_user_id_foreign",
      columns: [t.userId],
      foreignColumns: [users.userId],
    }).onDelete("cascade"),
    index("watch_comments_watch_id_idx").on(t.watchId),
  ],
);

// Added by the monolith (migration 0002): one like per user per watch.
export const watchLikes = pgTable(
  "watch_likes",
  {
    watchId: uuid("watch_id")
      .notNull()
      .references(() => watches.watchId, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ name: "watch_likes_pkey", columns: [t.watchId, t.userId] })],
);

export const watchFavorites = pgTable(
  "watch_favorites",
  {
    watchFavoriteId: uuid("watch_favorite_id").primaryKey(),
    userId: uuid("user_id"),
    watchId: uuid("watch_id"),
    createdAt: timestamptz("created_at"),
    updatedAt: timestamptz("updated_at"),
  },
  (t) => [
    foreignKey({
      name: "watch_favorites_user_id_foreign",
      columns: [t.userId],
      foreignColumns: [users.userId],
    }).onDelete("cascade"),
    foreignKey({
      name: "watch_favorites_watch_id_foreign",
      columns: [t.watchId],
      foreignColumns: [watches.watchId],
    }).onDelete("cascade"),
    unique("watch_favorites_user_id_watch_id_unique").on(t.userId, t.watchId),
  ],
);

// Added by the monolith (migration 0003): fixed-window counters for login / sign-up throttling.
// Keys are SHA-256 hashes ("login:email", "register-ip:…"), so no raw emails or IPs are stored.
export const authRateLimits = pgTable("auth_rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  resetAt: timestamptz("reset_at").notNull(),
});

// Added by the monolith (migration 0004): the newsletter list, for visitors and readers alike.
// Signed-in readers' "Newsletter" toggle writes here too (users.newsletter is kept in sync).
// status: "active" | "unsubscribed". unsubscribe_token: the one-click link in every email.
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  email: varchar("email", { length: 254 }).primaryKey(),
  userId: uuid("user_id").references(() => users.userId, { onDelete: "set null" }),
  status: text("status").notNull().default("active"),
  unsubscribeToken: text("unsubscribe_token").notNull().unique(),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at").notNull().defaultNow(),
});

// Added by the monolith (migration 0007): newsletters written and sent from /admin/newsletter.
// status: "draft" | "sending" | "sent". items: the reads/videos shown as cards under the text.
export const newsletterCampaigns = pgTable("newsletter_campaigns", {
  campaignId: uuid("campaign_id").primaryKey(),
  subject: varchar("subject", { length: 200 }).notNull().default(""),
  preheader: varchar("preheader", { length: 200 }).notNull().default(""),
  body: text("body").notNull().default(""),
  items: jsonb("items").$type<{ kind: "read" | "watch"; id: string }[]>().notNull().default([]),
  status: text("status").notNull().default("draft"),
  createdBy: uuid("created_by").references(() => users.userId, { onDelete: "set null" }),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at").notNull().defaultNow(),
  sentAt: timestamptz("sent_at"),
});

// One row per recipient, written when sending starts: sending can resume after an interruption
// without mailing anyone twice. status: "pending" | "claimed" | "sent" | "failed" | "skipped".
export const newsletterDeliveries = pgTable(
  "newsletter_deliveries",
  {
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => newsletterCampaigns.campaignId, { onDelete: "cascade" }),
    email: varchar("email", { length: 254 }).notNull(),
    status: text("status").notNull().default("pending"),
    error: text("error"),
    sentAt: timestamptz("sent_at"),
  },
  (t) => [primaryKey({ name: "newsletter_deliveries_pkey", columns: [t.campaignId, t.email] })],
);
