# Troubleshooting Guide

## 🔐 Authorization Error (403) - "read_not_allowed"

### Error Message

```
Error uploading video file: {
  code: 'read_not_allowed',
  message: 'The caller is not authorized to read entity [index-id].'
}
```

### What This Means

This error occurs when your Twelve Labs API key doesn't have permission to write to the specified index. This can happen for several reasons:

1. **Wrong Index ID**: The `TWELVE_LABS_INDEX_ID` in your `.env` file belongs to a different account or project
2. **Wrong API Key**: The `TWELVE_LABS_API_KEY` doesn't have access to the index
3. **Index from Different Account**: You're trying to use an index that was created with a different API key

### Solution Options

#### Option 1: Create a New Index (Recommended)

Remove or comment out the `TWELVE_LABS_INDEX_ID` from your `.env` file:

```env
TWELVE_LABS_API_KEY=your-api-key-here
# TWELVE_LABS_INDEX_ID=  # Comment this out or remove it
```

The application will automatically create a new index for you on the next upload attempt.

#### Option 2: Use the Command Line Script

Use the provided upload script which will handle index creation:

```bash
npm run upload-video https://your-video-url.mp4
```

This script will:

- Check for existing indexes
- Create a new one if needed
- Provide you with the index ID to add to your `.env`

#### Option 3: Get Your Index ID from Twelve Labs Console

1. Go to the [Twelve Labs Console](https://playground.twelvelabs.io/)
2. Navigate to your indexes
3. Copy the Index ID that matches your API key
4. Update your `.env` file:

```env
TWELVE_LABS_INDEX_ID=your-correct-index-id
```

### Verifying Your Setup

After making changes, verify your configuration:

```bash
# Test with the upload script
npm run upload-video https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4
```

If successful, you'll see:

```
Video indexed successfully!
Twelve Labs Video ID: [video-id]
Index ID: [index-id]
```

---

## 📁 File Upload Errors

### File Too Large

**Error**: File size exceeds 2GB

**Solution**:

- Compress your video
- Use a lower resolution (minimum 360x360)
- Split long videos into shorter segments

### Invalid Format

**Error**: Video format not supported

**Solution**:

- Use a standard format (MP4, MOV, AVI, etc.)
- Check aspect ratio (must be 1:1, 4:3, 4:5, 5:4, 16:9, 9:16, or 17:9)
- Ensure video duration is between 4 seconds and 2 hours

---

## 🔄 Processing Issues

### Video Stuck in "Processing"

If a video remains in "processing" status for more than 15 minutes:

1. Check the video in Twelve Labs Console
2. The video may have failed indexing
3. Try re-uploading with different settings

### HLS Not Available

If video plays but HLS streaming isn't working:

**Cause**: Video was uploaded without `enable_video_stream` flag

**Solution**: Re-upload the video using:

```bash
npm run upload-video https://your-video-url.mp4
```

Or use the "Upload New Video" feature in the app (which now sets this flag automatically).

---

## 🌐 Network Issues

### Timeout During Upload

For large videos, the upload may timeout:

**Solution**:

- Use a faster internet connection
- Upload smaller video files
- Consider using the command-line script which has better timeout handling

---

## 🗄️ Database Errors

### "invalid input syntax for type integer"

**Cause**: Data type mismatch (e.g., float instead of integer)

**Status**: This has been fixed in the latest version. Update your code if you see this error.

---

## 💡 General Tips

1. **Always check console logs**: Run `npm run dev` and watch the terminal for detailed error messages
2. **Use the video library**: The "Select from Library" option is more reliable than uploading
3. **Test with short videos first**: Use the 10-second test video to verify your setup
4. **Keep API keys secure**: Never commit `.env` files to version control

---

## 📞 Still Having Issues?

If none of these solutions work:

1. Check the [Twelve Labs Documentation](https://docs.twelvelabs.io/v1.3/docs/introduction)
2. Verify your API key at [Twelve Labs Console](https://playground.twelvelabs.io/)
3. Review the application logs for detailed error messages
4. Ensure all environment variables are correctly set in `.env`
