import { db } from "../src/lib/db";
import { videos, adMoments, adRecommendations } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
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

async function checkDatabase() {
  console.log("\n📊 Database Status Check\n");

  try {
    // Get all videos
    const allVideos = await db.select().from(videos);
    console.log(`📹 Total Videos: ${allVideos.length}\n`);

    for (const video of allVideos) {
      console.log(`Video: ${video.filename}`);
      console.log(`  ID: ${video.id}`);
      console.log(`  Status: ${video.status}`);
      console.log(`  Uploaded: ${video.uploadedAt}`);

      // Get moments for this video
      const moments = await db.query.adMoments.findMany({
        where: eq(adMoments.videoId, video.id),
        with: {
          recommendations: true,
        },
      });

      console.log(`  📍 Moments: ${moments.length}`);

      for (const moment of moments) {
        console.log(`\n    Moment ${moment.id}:`);
        console.log(`      Time: ${moment.startTime}s - ${moment.endTime}s`);
        console.log(`      Context: ${moment.context.substring(0, 100)}...`);
        console.log(`      Category: ${moment.category}`);
        console.log(`      Emotion: ${moment.emotionalTone}`);
        console.log(`      Confidence: ${moment.confidence}%`);
        console.log(
          `      🎯 Recommendations: ${moment.recommendations.length}`
        );

        for (const rec of moment.recommendations) {
          console.log(`\n        ✓ ${rec.productName} (${rec.brandName})`);
          console.log(`          Score: ${rec.relevanceScore}%`);
          console.log(
            `          Reasoning: ${rec.reasoning?.substring(0, 80)}...`
          );
          console.log(`          Selected: ${rec.selected}`);
        }
      }

      console.log("\n" + "─".repeat(80) + "\n");
    }

    // Summary
    const totalMoments = await db.select().from(adMoments);
    const totalRecs = await db.select().from(adRecommendations);

    console.log("\n📈 Summary:");
    console.log(`   Videos: ${allVideos.length}`);
    console.log(`   Moments: ${totalMoments.length}`);
    console.log(`   Recommendations: ${totalRecs.length}`);
    console.log("");
  } catch (error) {
    console.error("❌ Error checking database:", error);
    process.exit(1);
  }
}

checkDatabase();
