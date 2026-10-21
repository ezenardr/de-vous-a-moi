// Mirrors the tables created by the AdonisJS migrations in api.messarae.com.
// Knex mappings on Postgres: string → varchar(255), enum → text + CHECK,
// timestamp → timestamptz, increments → serial.
// Do not change existing columns here without a reviewed, additive migration: the site is live.
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true });
const updatedAt = () => timestamp("updated_at", { withTimezone: true });

export const users = pgTable("users", {
  userId: uuid("user_id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 254 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  profileImageUrl: text("profile_image_url"),
  imageFileId: text("image_file_id"),
  role: text("role").$type<"1" | "2" | "3" | "4">().default("1"),
  newRead: boolean("new_read").notNull().default(true),
  newWatch: boolean("new_watch").notNull().default(true),
  newsletter: boolean("newsletter").notNull().default(true),
  accountActivity: boolean("account_activity").notNull().default(true),
  resendCount: integer("resend_count").default(0),
  lastResendAt: timestamp("last_resend_at", { withTimezone: true }),
  createdAt: createdAt().notNull(),
  updatedAt: updatedAt(),
});

// Adonis access tokens. Unused by the monolith; dropped only after the API is decommissioned.
export const authAccessTokens = pgTable("auth_access_tokens", {
  id: serial("id").primaryKey(),
  tokenableId: uuid("tokenable_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  type: varchar("type", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  hash: varchar("hash", { length: 255 }).notNull(),
  abilities: text("abilities").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
});

export const readDrafts = pgTable("read_drafts", {
  readDraftId: uuid("read_draft_id").primaryKey(),
  userId: uuid("user_id").references(() => users.userId, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }),
  description: varchar("description", { length: 255 }),
  imageUrl: text("image_url"),
  imageFileId: text("image_file_id"),
  category: text("category"),
  content: text("content"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const reads = pgTable("reads", {
  readId: uuid("read_id").primaryKey(),
  userId: uuid("user_id").references(() => users.userId, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  imageUrl: text("image_url").notNull(),
  imageFileId: text("image_file_id").notNull(),
  category: text("category").notNull(),
  content: text("content").notNull(),
  featured: boolean("featured").default(false),
  archived: boolean("archived").default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const readComments = pgTable("read_comments", {
  readCommentId: uuid("read_comment_id").primaryKey(),
  readId: uuid("read_id").references(() => reads.readId, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.userId, { onDelete: "cascade" }),
  comment: text("comment").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const favorites = pgTable(
  "favorites",
  {
    favoriteId: uuid("favorite_id").primaryKey(),
    userId: uuid("user_id").references(() => users.userId, { onDelete: "cascade" }),
    readId: uuid("read_id").references(() => reads.readId, { onDelete: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [unique().on(t.userId, t.readId)],
);

export const watches = pgTable("watches", {
  watchId: uuid("watch_id").primaryKey(),
  userId: uuid("user_id").references(() => users.userId, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  imageUrl: text("image_url").notNull(),
  imageFileId: text("image_file_id").notNull(),
  category: text("category").notNull(),
  videoUrl: text("video_url").notNull(),
  featured: boolean("featured").default(false),
  archived: boolean("archived").default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const watchComments = pgTable("watch_comments", {
  watchCommentId: uuid("watch_comment_id").primaryKey(),
  watchId: uuid("watch_id").references(() => watches.watchId, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.userId, { onDelete: "cascade" }),
  comment: text("comment").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const watchFavorites = pgTable(
  "watch_favorites",
  {
    watchFavoriteId: uuid("watch_favorite_id").primaryKey(),
    userId: uuid("user_id").references(() => users.userId, { onDelete: "cascade" }),
    watchId: uuid("watch_id").references(() => watches.watchId, { onDelete: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [unique().on(t.userId, t.watchId)],
);
