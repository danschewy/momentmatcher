CREATE TABLE IF NOT EXISTS "ad_moments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" uuid NOT NULL,
	"start_time" integer NOT NULL,
	"end_time" integer NOT NULL,
	"context" text NOT NULL,
	"emotional_tone" text,
	"category" text,
	"confidence" integer,
	"clip_url" text,
	"thumbnail_url" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ad_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"moment_id" uuid NOT NULL,
	"product_name" text NOT NULL,
	"brand_name" text,
	"description" text,
	"product_url" text,
	"image_url" text,
	"reasoning" text,
	"relevance_score" integer,
	"selected" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"twelve_labs_data" jsonb,
	"video_url" text,
	"duration" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ad_moments" ADD CONSTRAINT "ad_moments_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ad_recommendations" ADD CONSTRAINT "ad_recommendations_moment_id_ad_moments_id_fk" FOREIGN KEY ("moment_id") REFERENCES "public"."ad_moments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
