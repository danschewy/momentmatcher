-- Initial schema migration for MomentMatch AI

-- Create videos table
CREATE TABLE IF NOT EXISTS "videos" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "filename" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "twelve_labs_data" JSONB,
    "video_url" TEXT,
    "duration" INTEGER
);

-- Create ad_moments table
CREATE TABLE IF NOT EXISTS "ad_moments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "video_id" UUID NOT NULL REFERENCES "videos"("id") ON DELETE CASCADE,
    "start_time" INTEGER NOT NULL,
    "end_time" INTEGER NOT NULL,
    "context" TEXT NOT NULL,
    "emotional_tone" TEXT,
    "category" TEXT,
    "confidence" INTEGER,
    "clip_url" TEXT,
    "thumbnail_url" TEXT
);

-- Create ad_recommendations table
CREATE TABLE IF NOT EXISTS "ad_recommendations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "moment_id" UUID NOT NULL REFERENCES "ad_moments"("id") ON DELETE CASCADE,
    "product_name" TEXT NOT NULL,
    "brand_name" TEXT,
    "description" TEXT,
    "product_url" TEXT,
    "image_url" TEXT,
    "reasoning" TEXT,
    "relevance_score" INTEGER,
    "selected" BOOLEAN DEFAULT FALSE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_moments_video_id" ON "ad_moments"("video_id");
CREATE INDEX IF NOT EXISTS "idx_recommendations_moment_id" ON "ad_recommendations"("moment_id");
CREATE INDEX IF NOT EXISTS "idx_videos_status" ON "videos"("status");

