# Brand Mentions Database Persistence Fix

## Problem

Brand mentions generated from the Twelve Labs Analyze endpoint were **only stored in memory** and returned in the API response. When users navigated away from the analyze page and came back, all brand mention data was lost because it wasn't being saved to the database.

## Solution

Added database persistence for brand mentions with a complete two-table structure similar to the existing ad moments system.

---

## Database Schema Changes

### New Tables

**1. `brand_mentions` table**

- `id` (uuid, primary key)
- `videoId` (text, foreign key to videos)
- `timestamp` (text) - MM:SS format
- `timeInSeconds` (integer)
- `description` (text) - AI-generated description
- `type` (text) - either "brand_mention" or "ad_opportunity"

**2. `brand_mention_recommendations` table**

- `id` (uuid, primary key)
- `brandMentionId` (uuid, foreign key to brand_mentions)
- `productName` (text)
- `brandName` (text)
- `description` (text)
- `productUrl` (text)
- `imageUrl` (text)
- `reasoning` (text)
- `relevanceScore` (integer, 0-100)

### Relations

Added Drizzle ORM relations to enable nested queries:

- `videos` → `brandMentions` (one-to-many)
- `brandMentions` → `recommendations` (one-to-many)

---

## Code Changes

### 1. Schema (`src/lib/db/schema.ts`)

```typescript
export const brandMentions = pgTable("brand_mentions", {
  id: uuid("id").primaryKey().defaultRandom(),
  videoId: text("video_id")
    .references(() => videos.id)
    .notNull(),
  timestamp: text("timestamp").notNull(),
  timeInSeconds: integer("time_in_seconds").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
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
    relevanceScore: integer("relevance_score"),
  }
);
```

### 2. Analyze Route (`src/app/api/analyze/route.ts`)

**Import with aliases to avoid naming conflicts:**

```typescript
import {
  brandMentions as brandMentionsTable,
  brandMentionRecommendations as brandMentionRecsTable,
} from "@/lib/db/schema";
```

**Save brand mentions to database (after AI analysis):**

```typescript
for (const mention of brandMentions) {
  const [savedMention] = await db
    .insert(brandMentionsTable)
    .values({
      videoId: dbVideo[0].id,
      timestamp: mention.timestamp,
      timeInSeconds: mention.timeInSeconds,
      description: mention.description,
      type: mention.type,
    })
    .returning();

  // Save recommendations for this mention
  for (const rec of mention.recommendations) {
    await db.insert(brandMentionRecsTable).values({
      brandMentionId: savedMention.id,
      productName: rec.productName,
      brandName: rec.brandName || null,
      // ... other fields
    });
  }
}
```

**Retrieve brand mentions from cache:**

```typescript
if (dbVideo[0].status === "completed") {
  // Fetch existing brand mentions with recommendations
  const existingBrandMentions = await db.query.brandMentions.findMany({
    where: eq(brandMentionsTable.videoId, videoId),
    with: {
      recommendations: true,
    },
  });

  // Transform and return
  const transformedBrandMentions = existingBrandMentions.map((mention) => ({
    timestamp: mention.timestamp,
    timeInSeconds: mention.timeInSeconds,
    description: mention.description,
    type: mention.type as "brand_mention" | "ad_opportunity",
    recommendations: mention.recommendations.map((rec) => ({
      /* ... */
    })),
  }));

  return NextResponse.json({
    moments: transformedMoments,
    brandMentions: transformedBrandMentions, // ✅ Now included
    cached: true,
  });
}
```

---

## Benefits

✅ **Persistent Data** - Brand mentions survive page navigation and refreshes
✅ **Consistent Architecture** - Mirrors the existing ad moments structure
✅ **Relational Integrity** - Foreign key constraints ensure data consistency
✅ **Nested Queries** - Drizzle relations enable efficient data fetching
✅ **Complete Caching** - Both moments and brand mentions are cached after first analysis

---

## Testing

1. **Start dev server**: `npm run dev`
2. **Analyze a video** - Brand mentions will be generated and saved to DB
3. **Navigate away** - Go back to home page
4. **Return to analyze** - Select the same video again
5. **Verify** - Brand mentions should appear immediately from cache

You can also verify database contents:

```bash
npm run check-db
```

Look for the `brand_mentions` and `brand_mention_recommendations` tables in the output.

---

## Migration

The schema was pushed to the database using:

```bash
npm run db:push
```

If you need to reset the database and start fresh:

```bash
npm run db:reset
```

---

## Notes

- Brand mentions are generated using the **Twelve Labs `/analyze` endpoint** (not `/generate`)
- Each brand mention can have up to 3 product recommendations from OpenAI
- The caching logic checks if `status === "completed"` before returning cached data
- Error handling wraps each mention save operation to prevent partial failures from breaking the entire analysis
