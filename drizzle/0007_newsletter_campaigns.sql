CREATE TABLE "newsletter_campaigns" (
	"campaign_id" uuid PRIMARY KEY NOT NULL,
	"subject" varchar(200) DEFAULT '' NOT NULL,
	"preheader" varchar(200) DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "newsletter_deliveries" (
	"campaign_id" uuid NOT NULL,
	"email" varchar(254) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error" text,
	"sent_at" timestamp with time zone,
	CONSTRAINT "newsletter_deliveries_pkey" PRIMARY KEY("campaign_id","email")
);
--> statement-breakpoint
ALTER TABLE "newsletter_campaigns" ADD CONSTRAINT "newsletter_campaigns_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_deliveries" ADD CONSTRAINT "newsletter_deliveries_campaign_id_newsletter_campaigns_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."newsletter_campaigns"("campaign_id") ON DELETE cascade ON UPDATE no action;