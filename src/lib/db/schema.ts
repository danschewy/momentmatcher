import {
  pgTable,
  text,
  timestamp,
  jsonb,
  uuid,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  status: text("status").notNull().default("processing"), // processing, completed, failed
  twelveLabs: jsonb("twelve_labs_data"), // Store Twelve Labs response
  videoUrl: text("video_url"),
  duration: integer("duration"), // in seconds
});

export const adMoments = pgTable("ad_moments", {
  id: uuid("id").primaryKey().defaultRandom(),
  videoId: uuid("video_id")
    .references(() => videos.id)
    .notNull(),
  startTime: integer("start_time").notNull(), // in seconds
  endTime: integer("end_time").notNull(),
  context: text("context").notNull(),
  emotionalTone: text("emotional_tone"), // positive, neutral, negative, excited, etc.
  category: text("category"), // educational, sports, lifestyle, etc.
  confidence: integer("confidence"), // 0-100
  clipUrl: text("clip_url"),
  thumbnailUrl: text("thumbnail_url"),
});

export const adRecommendations = pgTable("ad_recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),
  momentId: uuid("moment_id")
    .references(() => adMoments.id)
    .notNull(),
  productName: text("product_name").notNull(),
  brandName: text("brand_name"),
  description: text("description"),
  productUrl: text("product_url"),
  imageUrl: text("image_url"),
  reasoning: text("reasoning"), // Why this ad fits
  relevanceScore: integer("relevance_score"), // 0-100
  selected: boolean("selected").default(false),
});
