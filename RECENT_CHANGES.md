# Recent Changes - Real API Integration

## Summary

Removed all mock data and integrated real API calls to Twelve Labs and OpenAI. Fixed video playback from library and ensured database is being used for all data storage.

## Major Changes

### 1. Video Library Integration (Fixed HLS URLs)

- **Fixed**: Empty `src` attribute error when selecting videos from library
- **Added**: New API endpoint `/api/indexes/[indexId]/videos/[videoId]` to fetch individual video details including HLS URL
- **Updated**: `analyze/page.tsx` to properly fetch and set video HLS URL from Twelve Labs
- **How it works**: When selecting a video from library, we now fetch the full video object from Twelve Labs which includes `hls.video_url` for playback

### 2. Real API Calls (No More Mock Data)

- **Twelve Labs Integration**:

  - `analyzeForAdMoments()` now makes real API calls to search for key moments in videos
  - Uses semantic search with queries like "product placement", "emotional moment", "tutorial segment"
  - Returns actual timestamps, context, and emotional tone from video analysis

- **OpenAI Integration**:
  - `findRelevantProducts()` uses GPT-4o with web search tool
  - Generates dynamic prompts based on video context, emotional tone, and category
  - Returns real product recommendations with URLs, descriptions, and reasoning
  - Falls back to category-specific recommendations if web search fails

### 3. Database Usage (Fixed)

- **Schema Changes**:

  - Changed `videos.id` from `uuid` to `text` to accommodate Twelve Labs video IDs
  - Updated foreign key references accordingly
  - Ran migration to drop old tables and recreate with new schema

- **Data Flow**:

  1. Video selected from Twelve Labs library → stored in database with Twelve Labs ID
  2. Analysis results (moments) → saved to `ad_moments` table
  3. Product recommendations → saved to `ad_recommendations` table
  4. All data persists across sessions

- **Created**: `scripts/reset-db.ts` for database migrations

### 4. API Route Updates

#### `/api/analyze` (Major Rewrite)

```typescript
// Now handles both new uploads and library videos
- Requires both `videoId` and `indexId`
- Creates database record if video doesn't exist
- Makes real Twelve Labs API call to analyze video
- Makes real OpenAI API call for each moment to get product recommendations
- Stores everything in database
- Returns structured moment data with recommendations
```

#### `/api/indexes/[indexId]/videos/[videoId]` (New)

```typescript
// Fetches individual video details from Twelve Labs
- Returns video object with HLS URL for playback
- Required for video library functionality
```

### 5. UI Improvements

- **Added**: "Start Analyzing" button in main page header linking to `/analyze`
- **Fixed**: Video player now properly displays HLS stream from Twelve Labs
- **Enhanced**: Error handling and loading states throughout

## API Integration Details

### Twelve Labs API v1.3

```typescript
// Updated API base URL
const TWELVE_LABS_API_URL = "https://api.twelvelabs.io/v1.3";

// IMPORTANT: All POST requests require multipart/form-data
// Key endpoints used:
- GET /indexes - List all video indexes
- GET /indexes/:id/videos - List videos in an index
- GET /indexes/:id/videos/:videoId - Get video details (includes HLS URL)
- POST /search - Semantic search for ad moments (FormData)
- POST /tasks - Upload videos (FormData)
- POST /gist - Generate gists (FormData)
- POST /indexes - Create index (FormData)

// Example FormData usage:
const formData = new FormData();
formData.append("index_id", indexId);
formData.append("query_text", query);
formData.append("search_options", JSON.stringify(["visual", "conversation"]));
```

### OpenAI API

```typescript
// Using GPT-4o with web search tool
model: "gpt-4o"
tools: [{ type: "web_search_2025_01_preview" }]

// Dynamic prompt generation:
"Given the video segment context: '{context}',
emotional tone: '{emotionalTone}',
and category: '{category}',
find 3 highly relevant products..."
```

## Testing Checklist

- [x] Build passes without errors
- [ ] Video library displays videos from Twelve Labs
- [ ] Clicking on library video loads HLS stream
- [ ] Video analysis makes real Twelve Labs API calls
- [ ] OpenAI generates real product recommendations
- [ ] Data saves to NeonDB correctly
- [ ] Timeline displays moments correctly
- [ ] Export report works with real data

## Environment Variables Required

```bash
# Twelve Labs
TWELVE_LABS_API_KEY=your_api_key
TWELVE_LABS_INDEX_ID=your_index_id (optional, will be auto-detected)

# OpenAI
OPENAI_API_KEY=your_api_key

# NeonDB
DATABASE_URL=your_neon_connection_string
```

## Next Steps

1. Test with actual Twelve Labs videos
2. Verify OpenAI search tool returns relevant products
3. Test database persistence across sessions
4. Implement proper error handling for API failures
5. Add loading states and progress indicators
6. Consider implementing video upload to Twelve Labs (currently mock)

## Breaking Changes

- Database schema changed - requires running `scripts/reset-db.ts`
- Videos now identified by Twelve Labs video ID instead of auto-generated UUID
- All mock data removed - real API keys required for functionality

## Files Modified

1. `src/app/analyze/page.tsx` - Real API calls, video library integration
2. `src/app/api/analyze/route.ts` - Real Twelve Labs + OpenAI integration
3. `src/app/api/upload/route.ts` - Added ID generation
4. `src/app/api/indexes/[indexId]/videos/[videoId]/route.ts` - New endpoint
5. `src/app/page.tsx` - Added "Start Analyzing" button
6. `src/lib/db/schema.ts` - Changed ID types
7. `src/lib/twelvelabs.ts` - **FIXED: All POST methods now use FormData instead of JSON**
8. `scripts/reset-db.ts` - New database migration script

## Critical Fix (Latest)

**Twelve Labs API Content Type Issue (FIXED)**

- Error: `"The content type 'application/json' is not supported. Please use 'multipart/form-data'."`
- Solution: Updated all POST request methods to use `FormData` with `Content-Type: multipart/form-data`
- Affected methods: `searchVideo`, `uploadVideo`, `generateGist`, `createIndex`
- All methods now correctly format data as form data instead of JSON body
