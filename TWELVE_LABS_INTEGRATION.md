# 🎬 Twelve Labs Integration - Video Library Feature

## Overview

MomentMatch AI now supports **browsing and analyzing previously uploaded videos** from your Twelve Labs indexes, eliminating the need to re-upload videos every time you want to analyze them.

## How Twelve Labs Indexes Work

### Key Concepts

1. **Indexes**: Containers for your processed video content

   - Each index has a unique ID
   - Videos are stored within indexes
   - Indexes enable search and analysis capabilities

2. **Videos**: Stored permanently in indexes

   - Each video gets a unique `_id`
   - Videos include metadata (filename, duration, etc.)
   - Once indexed, videos can be referenced repeatedly

3. **No Re-uploads Needed**:
   - Upload once → analyze forever
   - Reference videos by their ID
   - Saves bandwidth and processing time

## New Features Added

### 1. List Indexes

```typescript
// Get all available indexes
const indexes = await twelveLabsClient.listIndexes();
// Returns: Array of indexes with names and video counts
```

**API Endpoint:** `GET /api/indexes`

### 2. List Videos in Index

```typescript
// Get all videos in a specific index
const videos = await twelveLabsClient.listVideos(indexId);
// Returns: Array of videos with metadata
```

**API Endpoint:** `GET /api/indexes/{indexId}/videos`

### 3. Get Specific Video

```typescript
// Get details of a specific video
const video = await twelveLabsClient.getVideo(indexId, videoId);
// Returns: Video details including HLS URL for streaming
```

### 4. Video Library Component

New `<VideoLibrary />` component that:

- Displays all your previously uploaded videos
- Shows video metadata (filename, duration, upload date)
- Allows one-click selection for analysis
- Supports multiple indexes

## User Workflow

### Before (Old Way)

1. Upload video
2. Wait for processing
3. Analyze
4. Want to analyze same video again? → Upload again 😞

### Now (New Way)

1. **Select from Library** or upload new video
2. Choose from previously uploaded videos
3. Instant analysis (no upload wait!)
4. Analyze same video anytime 🎉

## UI Updates

### Analyze Page Now Has Two Modes:

1. **Select from Library** (Default)

   - Browse all videos in your Twelve Labs indexes
   - Click any video to analyze
   - See video metadata (filename, duration, age)
   - Organized by index

2. **Upload New Video**
   - Traditional upload flow
   - For brand new content
   - Gets added to your library automatically

### Toggle Between Modes

```
[Select from Library] [Upload New Video]
        ^active          ^inactive
```

## Technical Implementation

### New Functions in `twelvelabs.ts`

```typescript
// List all indexes
async listIndexes(): Promise<TwelveLabsIndex[]>

// Get specific index
async getIndex(indexId: string): Promise<TwelveLabsIndex>

// List videos in index
async listVideos(indexId: string): Promise<TwelveLabsVideo[]>

// Get specific video
async getVideo(indexId: string, videoId: string): Promise<TwelveLabsVideo>
```

### New API Routes

```
GET /api/indexes
GET /api/indexes/{indexId}/videos
```

### New Component

```
<VideoLibrary onVideoSelect={(indexId, videoId, filename) => {...}} />
```

## Benefits

### For Users

- ✅ No repeated uploads
- ✅ Faster analysis
- ✅ Easy access to video history
- ✅ Organized video library

### For System

- ✅ Reduced bandwidth usage
- ✅ Lower processing costs
- ✅ Better API efficiency
- ✅ Cleaner data flow

## Example Usage

### Selecting from Library

1. Navigate to `/analyze`
2. See "Select from Library" mode (default)
3. Browse your videos
4. Click on any video
5. Instant analysis starts!

### API Integration

```typescript
// Frontend code
const handleVideoSelect = async (indexId: string, videoId: string) => {
  // Fetch ad moments for this video from Twelve Labs
  const moments = await fetch(`/api/analyze`, {
    method: "POST",
    body: JSON.stringify({ indexId, videoId }),
  });

  // Display results
  setAdMoments(moments);
};
```

## Twelve Labs API Endpoints Used

```bash
# List indexes
GET https://api.twelvelabs.io/v1.2/indexes

# Get index details
GET https://api.twelvelabs.io/v1.2/indexes/{index_id}

# List videos in index
GET https://api.twelvelabs.io/v1.2/indexes/{index_id}/videos

# Get video details
GET https://api.twelvelabs.io/v1.2/indexes/{index_id}/videos/{video_id}
```

## Environment Requirements

Make sure your `.env.local` includes:

```env
TWELVE_LABS_API_KEY=your_api_key_here
```

## Demo Mode

Even without a Twelve Labs API key, the app gracefully handles:

- Shows friendly error message
- Falls back to upload mode
- Demo data still works

## Future Enhancements

Potential improvements:

- [ ] Filter videos by upload date
- [ ] Search videos by filename
- [ ] Sort by duration, date, etc.
- [ ] Bulk analysis of multiple videos
- [ ] Video thumbnails from Twelve Labs
- [ ] Delete videos from UI
- [ ] Edit video metadata

## Troubleshooting

### "No indexes found"

- Check if TWELVE_LABS_API_KEY is set
- Verify you have videos in your Twelve Labs account
- Upload your first video to create an index

### "Failed to fetch videos"

- Verify API key is valid
- Check network connection
- Ensure index ID is correct

### Videos not showing

- Verify videos are fully processed in Twelve Labs
- Check index has videos (video_count > 0)
- Try refreshing the page

## Documentation References

- [Twelve Labs API Docs](https://docs.twelvelabs.io)
- [Video Indexing Guide](https://docs.twelvelabs.io/api-reference/tasks/create)
- [Search API](https://docs.twelvelabs.io/api-reference/search)

---

**This feature makes MomentMatch AI more efficient and user-friendly by leveraging Twelve Labs' powerful video indexing system!** 🚀
