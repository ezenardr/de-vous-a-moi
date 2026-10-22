ALTER TABLE "reads" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "watches" ADD COLUMN "published_at" timestamp with time zone;