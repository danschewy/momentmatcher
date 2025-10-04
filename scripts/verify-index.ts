import { createTwelveLabsClient } from "../src/lib/twelvelabs";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables manually
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

async function verifyIndex() {
  const client = createTwelveLabsClient();
  const targetIndexId = process.env.TWELVE_LABS_INDEX_ID;

  console.log("\n🔍 Verifying Twelve Labs Configuration...\n");
  console.log(`API Key: ${process.env.TWELVE_LABS_API_KEY?.slice(0, 10)}...`);
  console.log(`Target Index ID: ${targetIndexId}\n`);

  try {
    // List all indexes
    console.log("📋 Fetching all accessible indexes...");
    const indexes = await client.listIndexes();
    console.log(`✅ Found ${indexes.length} indexes:\n`);

    indexes.forEach((index, i) => {
      const isTarget = index._id === targetIndexId;
      console.log(
        `${isTarget ? "👉" : "  "} ${i + 1}. ${index.index_name} (ID: ${
          index._id
        })`
      );
      console.log(`     Video Count: ${index.video_count || 0}`);
      console.log(
        `     Engines: ${
          index.engines?.map((e: any) => e.engine_name).join(", ") || "N/A"
        }`
      );
      if (isTarget) {
        console.log(`     ⭐ THIS IS YOUR TARGET INDEX`);
      }
      console.log("");
    });

    // Check if target index exists
    if (!targetIndexId) {
      console.log(
        "⚠️  No TWELVE_LABS_INDEX_ID set in .env file. The app will use the first available index."
      );
      return;
    }

    const targetIndex = indexes.find((idx) => idx._id === targetIndexId);

    if (!targetIndex) {
      console.log(`❌ ERROR: Target index ${targetIndexId} not found!`);
      console.log("\nPossible solutions:");
      console.log(
        "1. The index ID in your .env file might be incorrect or from a different account"
      );
      console.log("2. Your API key doesn't have access to this index");
      console.log(
        "3. Use one of the index IDs listed above, or remove TWELVE_LABS_INDEX_ID to auto-create a new one\n"
      );
      process.exit(1);
    }

    console.log("✅ Target index verified successfully!");
    console.log(`\nIndex Details:`);
    console.log(`  Name: ${targetIndex.index_name}`);
    console.log(`  ID: ${targetIndex._id}`);
    console.log(`  Videos: ${targetIndex.video_count || 0}`);
    console.log(
      `  Engines: ${
        targetIndex.engines?.map((e: any) => e.engine_name).join(", ") || "N/A"
      }`
    );

    // Try to get index details (more detailed check)
    console.log("\n🔍 Testing index access...");
    try {
      const videos = await client.listVideos(targetIndexId);
      console.log(
        `✅ Successfully accessed index! Found ${videos.length} videos.\n`
      );

      if (videos.length > 0) {
        console.log("Recent videos:");
        videos.slice(0, 3).forEach((video, i) => {
          console.log(
            `  ${i + 1}. ${video.metadata?.filename || "Untitled"} (${
              video._id
            })`
          );
        });
      }
    } catch (error: any) {
      console.log("❌ Failed to access index videos!");
      console.log(`Error: ${error.response?.data?.message || error.message}\n`);
    }
  } catch (error: any) {
    console.error(
      "❌ Error verifying index:",
      error.response?.data || error.message
    );
    process.exit(1);
  }
}

verifyIndex();
