import {
  pgTable,
  text,
  timestamp,
  jsonb,
  uuid,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const videos = pgTable("videos", {
  id: text("id").primaryKey(), // Twelve Labs video ID
  filename: text("filename").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  status: text("status").notNull().default("processing"), // processing, completed, failed
  twelveLabs: jsonb("twelve_labs_data"), // Store Twelve Labs response
  videoUrl: text("video_url"),
  duration: integer("duration"), // in seconds
});

export const adMoments = pgTable("ad_moments", {
  id: uuid("id").primaryKey().defaultRandom(),
  videoId: text("video_id")
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
  // Revenue projections
  estimatedCPM: integer("estimated_cpm"), // Cost per 1000 impressions
  estimatedCTR: integer("estimated_ctr"), // Click-through rate as integer (multiply by 10, e.g. 2.5% = 25)
  projectedRevenue: integer("projected_revenue"), // Estimated revenue in cents
});

export const brandMentions = pgTable("brand_mentions", {
  id: uuid("id").primaryKey().defaultRandom(),
  videoId: text("video_id")
    .references(() => videos.id)
    .notNull(),
  timestamp: text("timestamp").notNull(), // MM:SS format
  timeInSeconds: integer("time_in_seconds").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // brand_mention or ad_opportunity
});

export const brandMentionRecommendations = pgTable(
  "brand_mention_recommendations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandMentionId: uuid("brand_mention_id")
      .references(() => brandMentions.id)
      .notNull(),
    productName: text("product_name").notNull(),
    brandName: text("brand_name"),
    description: text("description"),
    productUrl: text("product_url"),
    imageUrl: text("image_url"),
    reasoning: text("reasoning"),
    relevanceScore: integer("relevance_score"), // 0-100
    // Revenue projections
    estimatedCPM: integer("estimated_cpm"), // Cost per 1000 impressions
    estimatedCTR: integer("estimated_ctr"), // Click-through rate as integer (multiply by 10, e.g. 2.5% = 25)
    projectedRevenue: integer("projected_revenue"), // Estimated revenue in cents
  }
);

// Relations
export const videosRelations = relations(videos, ({ many }) => ({
  moments: many(adMoments),
  brandMentions: many(brandMentions),
}));

export const adMomentsRelations = relations(adMoments, ({ one, many }) => ({
  video: one(videos, {
    fields: [adMoments.videoId],
    references: [videos.id],
  }),
  recommendations: many(adRecommendations),
}));

export const adRecommendationsRelations = relations(
  adRecommendations,
  ({ one }) => ({
    moment: one(adMoments, {
      fields: [adRecommendations.momentId],
      references: [adMoments.id],
    }),
  })
);

export const brandMentionsRelations = relations(
  brandMentions,
  ({ one, many }) => ({
    video: one(videos, {
      fields: [brandMentions.videoId],
      references: [videos.id],
    }),
    recommendations: many(brandMentionRecommendations),
  })
);

export const brandMentionRecommendationsRelations = relations(
  brandMentionRecommendations,
  ({ one }) => ({
    brandMention: one(brandMentions, {
      fields: [brandMentionRecommendations.brandMentionId],
      references: [brandMentions.id],
    }),
  })
);
