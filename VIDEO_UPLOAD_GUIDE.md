# Video Upload & HLS Streaming Guide

## Overview

MomentMatch AI works with videos stored in Twelve Labs indexes. Videos must be uploaded to Twelve Labs with HLS streaming enabled to be playable in the application.

## HLS Structure (Per Twelve Labs API v1.3)

According to the [Twelve Labs API documentation](https://docs.twelvelabs.io/api-reference/videos/retrieve), the HLS object structure is:

```json
{
  "_id": "video-id",
  "hls": {
    "video_url": "https://cdn.example.com/video.m3u8",
    "thumbnail_urls": ["https://cdn.example.com/thumb.jpg"],
    "status": "COMPLETE",
    "updated_at": "2024-01-16T07:59:40.879Z"
  }
}
```

**Important**: The `hls` object is only present when videos are uploaded with `enable_video_stream: true`.

## Methods to Upload Videos

### Method 1: Use Existing Twelve Labs Videos (Recommended)

If you already have videos in Twelve Labs:

1. Go to the `/analyze` page
2. Click **"Select from Library"**
3. Choose a video from your Twelve Labs index
4. The app will analyze it automatically

**Note**: Videos must have been uploaded with `enable_video_stream=true` to be playable.

### Method 2: Upload via Command Line Script

Use the provided script to upload new videos:

```bash
# Upload a video from a public URL
npm run upload-video https://example.com/your-video.mp4

# Or use npx directly
npx tsx scripts/upload-video.ts https://example.com/your-video.mp4
```

The script will:

1. Check for existing Twelve Labs indexes
2. Create a new index if needed
3. Upload the video with HLS streaming enabled
4. Poll for completion
5. Display the video ID when ready

### Method 3: Upload via Twelve Labs Console

1. Go to [Twelve Labs Console](https://playground.twelvelabs.io/)
2. Create or select an index with Pegasus engine
3. Upload your video with **"Enable Video Stream"** checked
4. Copy the video ID and index ID
5. Use them in MomentMatch AI

### Method 4: Programmatic Upload (Advanced)

If you want to implement direct file uploads in the app:

```typescript
// 1. Upload video to storage (S3, Cloudinary, etc.)
const storageUrl = await uploadToS3(file);

// 2. Upload to Twelve Labs
const task = await twelveLabsClient.uploadVideo(storageUrl, indexId);

// 3. Poll for completion
while (task.status !== "ready") {
  await sleep(5000);
  task = await twelveLabsClient.getTaskStatus(task._id);
}

// 4. Save to database
await db.insert(videos).values({
  id: task.video_id,
  filename: file.name,
  status: "completed",
});
```

## Configuration

### Environment Variables

```bash
# Required
TWELVE_LABS_API_KEY=your_api_key_here
OPENAI_API_KEY=your_openai_key_here
DATABASE_URL=your_neon_connection_string

# Optional (auto-detected if not set)
TWELVE_LABS_INDEX_ID=your_index_id
```

### Twelve Labs Index Setup

Your index must be configured with:

- **Engine**: Marengo 2.7 or later (for embeddings)
- **Options**: `visual`, `audio` (minimum)
- **Video Streaming**: Enabled during upload

## Code Implementation

### Uploading with HLS Enabled

When uploading to Twelve Labs, always include `enable_video_stream: true`:

```typescript
const formData = new FormData();
formData.append("index_id", indexId);
formData.append("video_url", videoUrl);
formData.append("enable_video_stream", "true"); // CRITICAL!

const response = await axios.post(
  "https://api.twelvelabs.io/v1.3/tasks",
  formData,
  {
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "multipart/form-data",
    },
  }
);
```

### Retrieving HLS URL

```typescript
// Fetch video details
const video = await fetch(`/api/indexes/${indexId}/videos/${videoId}`);
const data = await video.json();

// Access HLS URL (wrapped in our API response)
const hlsUrl = data.video.hls.video_url;

// Set as video src
<video src={hlsUrl} controls />;
```

## Troubleshooting

### "Empty src attribute" Error

**Cause**: Video doesn't have HLS streaming enabled

**Solution**:

- Re-upload video with `enable_video_stream: true`
- Or use a video that was uploaded with HLS enabled

### "No HLS URL found" Warning

**Cause**: Video object doesn't contain `hls` property

**Check**:

```javascript
console.log("Video data:", videoData);
// Should show: { video: { _id: "...", hls: { video_url: "..." } } }
```

**Solution**:

- Verify video was uploaded with HLS enabled
- Check if video indexing is complete (`hls.status === "COMPLETE"`)

### Video Still Processing

**Symptom**: `hls` object present but `status !== "COMPLETE"`

**Solution**: Wait for Twelve Labs to finish processing. This can take several minutes depending on video length.

## API Endpoints

### Upload Video

- **POST** `/api/upload`
- Body: FormData with `videoUrl` (file upload not yet implemented)
- Returns: `{ videoId, indexId, status }`

### Get Video Details

- **GET** `/api/indexes/:indexId/videos/:videoId`
- Returns: `{ video: { _id, hls: { video_url, ... }, ... } }`

### Analyze Video

- **POST** `/api/analyze`
- Body: `{ indexId, videoId }`
- Returns: `{ moments: [...], success: true }`

## Best Practices

1. **Always Enable HLS**: Set `enable_video_stream: true` when uploading
2. **Check Status**: Verify `hls.status === "COMPLETE"` before playback
3. **Use Library**: Prefer selecting from existing videos over uploading
4. **Poll Wisely**: Use webhooks in production instead of polling
5. **Store Video IDs**: Save Twelve Labs video IDs in your database

## Example Workflow

```bash
# 1. Upload a test video
npm run upload-video https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4

# Output:
# ✅ Video indexed successfully!
# Video ID: 67abcd1234567890
# Index ID: 67xyz9876543210

# 2. Add to .env (if needed)
echo "TWELVE_LABS_INDEX_ID=67xyz9876543210" >> .env

# 3. Start the app
npm run dev

# 4. Navigate to /analyze and select the video from library
```

## Resources

- [Twelve Labs API Documentation](https://docs.twelvelabs.io/api-reference)
- [Video Retrieval API](https://docs.twelvelabs.io/api-reference/videos/retrieve)
- [Upload Videos API](https://docs.twelvelabs.io/api-reference/videos/upload)
- [Twelve Labs Playground](https://playground.twelvelabs.io/)
