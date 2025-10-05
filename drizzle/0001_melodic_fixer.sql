CREATE TABLE IF NOT EXISTS "brand_mention_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_mention_id" uuid NOT NULL,
	"product_name" text NOT NULL,
	"brand_name" text,
	"description" text,
	"product_url" text,
	"image_url" text,
	"reasoning" text,
	"relevance_score" integer,
	"estimated_cpm" integer,
	"estimated_ctr" integer,
	"projected_revenue" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "brand_mentions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" text NOT NULL,
	"timestamp" text NOT NULL,
	"time_in_seconds" integer NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"engagement_score" integer,
	"attention_score" integer,
	"placement_tier" text,
	"estimated_cpm_min" integer,
	"estimated_cpm_max" integer,
	"category_tags" text
);
--> statement-breakpoint
ALTER TABLE "ad_moments" ALTER COLUMN "video_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ad_moments" ADD COLUMN "engagement_score" integer;--> statement-breakpoint
ALTER TABLE "ad_moments" ADD COLUMN "attention_score" integer;--> statement-breakpoint
ALTER TABLE "ad_moments" ADD COLUMN "placement_tier" text;--> statement-breakpoint
ALTER TABLE "ad_moments" ADD COLUMN "estimated_cpm_min" integer;--> statement-breakpoint
ALTER TABLE "ad_moments" ADD COLUMN "estimated_cpm_max" integer;--> statement-breakpoint
ALTER TABLE "ad_moments" ADD COLUMN "category_tags" text;--> statement-breakpoint
ALTER TABLE "ad_recommendations" ADD COLUMN "estimated_cpm" integer;--> statement-breakpoint
ALTER TABLE "ad_recommendations" ADD COLUMN "estimated_ctr" integer;--> statement-breakpoint
ALTER TABLE "ad_recommendations" ADD COLUMN "projected_revenue" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "brand_mention_recommendations" ADD CONSTRAINT "brand_mention_recommendations_brand_mention_id_brand_mentions_id_fk" FOREIGN KEY ("brand_mention_id") REFERENCES "public"."brand_mentions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "brand_mentions" ADD CONSTRAINT "brand_mentions_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
