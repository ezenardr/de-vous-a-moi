CREATE TABLE "watch_likes" (
	"watch_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watch_likes_pkey" PRIMARY KEY("watch_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "watches" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "watches" ADD COLUMN "share_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "watches" ADD COLUMN "duration_seconds" integer;--> statement-breakpoint
ALTER TABLE "watch_likes" ADD CONSTRAINT "watch_likes_watch_id_watches_watch_id_fk" FOREIGN KEY ("watch_id") REFERENCES "public"."watches"("watch_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_likes" ADD CONSTRAINT "watch_likes_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "watch_comments_watch_id_idx" ON "watch_comments" USING btree ("watch_id");