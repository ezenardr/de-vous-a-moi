ALTER TABLE "read_comments" ADD COLUMN "parent_id" uuid;--> statement-breakpoint
ALTER TABLE "read_comments" ADD COLUMN "hidden_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "read_comments" ADD COLUMN "hidden_by" uuid;--> statement-breakpoint
ALTER TABLE "watch_comments" ADD COLUMN "parent_id" uuid;--> statement-breakpoint
ALTER TABLE "watch_comments" ADD COLUMN "hidden_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "watch_comments" ADD COLUMN "hidden_by" uuid;--> statement-breakpoint
ALTER TABLE "read_comments" ADD CONSTRAINT "read_comments_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."read_comments"("read_comment_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_comments" ADD CONSTRAINT "read_comments_hidden_by_fk" FOREIGN KEY ("hidden_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_comments" ADD CONSTRAINT "watch_comments_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."watch_comments"("watch_comment_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_comments" ADD CONSTRAINT "watch_comments_hidden_by_fk" FOREIGN KEY ("hidden_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "read_comments_parent_id_idx" ON "read_comments" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "watch_comments_parent_id_idx" ON "watch_comments" USING btree ("parent_id");