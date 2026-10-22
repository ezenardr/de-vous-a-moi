-- Production schema (generated from src/server/db/schema.ts, verified identical to prod via drizzle-kit pull). Test fixture only.
CREATE TABLE "auth_access_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"tokenable_id" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"name" varchar(255),
	"hash" varchar(255) NOT NULL,
	"abilities" text NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"favorite_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"read_id" uuid,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	CONSTRAINT "favorites_user_id_read_id_unique" UNIQUE("user_id","read_id")
);
--> statement-breakpoint
CREATE TABLE "read_comments" (
	"read_comment_id" uuid PRIMARY KEY NOT NULL,
	"read_id" uuid,
	"user_id" uuid,
	"comment" text NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "read_drafts" (
	"read_draft_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"title" varchar(255),
	"description" varchar(255),
	"image_url" text,
	"image_file_id" text,
	"category" text,
	"content" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "reads" (
	"read_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"image_url" text NOT NULL,
	"image_file_id" text NOT NULL,
	"category" text NOT NULL,
	"content" text NOT NULL,
	"featured" boolean DEFAULT false,
	"archived" boolean DEFAULT false,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(254) NOT NULL,
	"password" varchar(255) NOT NULL,
	"profile_image_url" text,
	"image_file_id" text,
	"role" text DEFAULT '1',
	"new_read" boolean DEFAULT true NOT NULL,
	"new_watch" boolean DEFAULT true NOT NULL,
	"newsletter" boolean DEFAULT true NOT NULL,
	"account_activity" boolean DEFAULT true NOT NULL,
	"resend_count" integer DEFAULT 0,
	"last_resend_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_role_check" CHECK (role = ANY (ARRAY['1'::text, '2'::text, '3'::text, '4'::text]))
);
--> statement-breakpoint
CREATE TABLE "watch_comments" (
	"watch_comment_id" uuid PRIMARY KEY NOT NULL,
	"watch_id" uuid,
	"user_id" uuid,
	"comment" text NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "watch_favorites" (
	"watch_favorite_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"watch_id" uuid,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	CONSTRAINT "watch_favorites_user_id_watch_id_unique" UNIQUE("user_id","watch_id")
);
--> statement-breakpoint
CREATE TABLE "watches" (
	"watch_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"image_url" text NOT NULL,
	"image_file_id" text NOT NULL,
	"category" text NOT NULL,
	"video_url" text NOT NULL,
	"featured" boolean DEFAULT false,
	"archived" boolean DEFAULT false,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "auth_access_tokens" ADD CONSTRAINT "auth_access_tokens_tokenable_id_foreign" FOREIGN KEY ("tokenable_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_read_id_foreign" FOREIGN KEY ("read_id") REFERENCES "public"."reads"("read_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_comments" ADD CONSTRAINT "read_comments_read_id_foreign" FOREIGN KEY ("read_id") REFERENCES "public"."reads"("read_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_comments" ADD CONSTRAINT "read_comments_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_drafts" ADD CONSTRAINT "read_drafts_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reads" ADD CONSTRAINT "reads_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_comments" ADD CONSTRAINT "watch_comments_watch_id_foreign" FOREIGN KEY ("watch_id") REFERENCES "public"."watches"("watch_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_comments" ADD CONSTRAINT "watch_comments_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_favorites" ADD CONSTRAINT "watch_favorites_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_favorites" ADD CONSTRAINT "watch_favorites_watch_id_foreign" FOREIGN KEY ("watch_id") REFERENCES "public"."watches"("watch_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watches" ADD CONSTRAINT "watches_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;