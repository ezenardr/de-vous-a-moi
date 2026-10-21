// Mirrors the live tables created by the AdonisJS migrations in api.messarae.com,
// verified with `drizzle-kit pull` against production on 2026-10-21.
// Constraint names match Knex's naming so generated migrations never touch existing constraints.
// Do not change existing columns without a reviewed, additive migration: the site is live.
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  integer,
  pgTable,
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
  },
  (t) => [
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
  ],
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
  },
  (t) => [
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
  ],
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
