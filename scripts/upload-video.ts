import { createTwelveLabsClient } from "../src/lib/twelvelabs";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables
const envFile = readFileSync(join(process.cwd(), ".env"), "utf-8");
envFile.split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
});

async function uploadVideo() {
  const videoUrl = process.argv[2];

  if (!videoUrl) {
    console.error("Usage: npx tsx scripts/upload-video.ts <video_url>");
    console.error(
      "\nExample: npx tsx scripts/upload-video.ts https://example.com/video.mp4"
    );
    process.exit(1);
  }

  try {
    const client = createTwelveLabsClient();

    // Get or create index
    let indexId = process.env.TWELVE_LABS_INDEX_ID;

    if (!indexId) {
      console.log(
        "No TWELVE_LABS_INDEX_ID found, checking existing indexes..."
      );
      const indexes = await client.listIndexes();

      if (indexes.length > 0) {
        indexId = indexes[0]._id;
        console.log(
          `Using existing index: ${indexes[0].index_name} (${indexId})`
        );
      } else {
        console.log("Creating new index...");
        const newIndex = await client.createIndex("momentmatch-videos");
        indexId = newIndex._id;
        console.log(`Created index: ${newIndex.index_name} (${indexId})`);
        console.log(
          `\nAdd this to your .env file:\nTWELVE_LABS_INDEX_ID=${indexId}`
        );
      }
    }

    if (!indexId) {
      console.error("Failed to get or create index");
      process.exit(1);
    }

    console.log(`\nUploading video: ${videoUrl}`);
    const task = await client.uploadVideo(videoUrl, indexId);

    console.log(`\nUpload task created: ${task._id}`);
    console.log(`Video ID: ${task.video_id}`);
    console.log("\nPolling for completion...");

    let status = await client.getTaskStatus(task._id);
    let attempts = 0;

    while (status.status !== "ready" && status.status !== "failed") {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      status = await client.getTaskStatus(task._id);
      attempts++;
      console.log(`[${attempts * 5}s] Status: ${status.status}`);
    }

    if (status.status === "failed") {
      console.error(`\n❌ Video indexing failed: ${status.message}`);
      process.exit(1);
    }

    console.log(`\n✅ Video indexed successfully!`);
    console.log(`\nVideo ID: ${task.video_id}`);
    console.log(`Index ID: ${indexId}`);
    console.log(
      `\nYou can now use this video in the MomentMatch AI application.`
    );
  } catch (error) {
    console.error("Error uploading video:", error);
    process.exit(1);
  }
}

uploadVideo();
