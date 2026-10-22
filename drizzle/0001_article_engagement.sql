CREATE TABLE "read_likes" (
	"read_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "read_likes_pkey" PRIMARY KEY("read_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "reads" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "reads" ADD COLUMN "share_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "read_likes" ADD CONSTRAINT "read_likes_read_id_reads_read_id_fk" FOREIGN KEY ("read_id") REFERENCES "public"."reads"("read_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_likes" ADD CONSTRAINT "read_likes_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "read_comments_read_id_idx" ON "read_comments" USING btree ("read_id");