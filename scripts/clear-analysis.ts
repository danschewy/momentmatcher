/**
 * Clear all analysis data (moments and brand mentions) while keeping videos
 * This allows re-analyzing videos with updated spot quality calculations
 */

// Load environment variables from .env file FIRST
import "dotenv/config";

import { db } from "../src/lib/db";
import {
  adMoments,
  adRecommendations,
  brandMentions,
  brandMentionRecommendations,
} from "../src/lib/db/schema";

async function clearAnalysis() {
  try {
    console.log("🧹 Clearing all analysis data...");

    // Delete in correct order due to foreign key constraints
    console.log("  Deleting brand mention recommendations...");
    await db.delete(brandMentionRecommendations);

    console.log("  Deleting brand mentions...");
    await db.delete(brandMentions);

    console.log("  Deleting ad recommendations...");
    await db.delete(adRecommendations);

    console.log("  Deleting ad moments...");
    await db.delete(adMoments);

    console.log("✅ Analysis data cleared successfully!");
    console.log(
      "   Videos are preserved and can be re-analyzed with updated spot quality features."
    );
  } catch (error) {
    console.error("❌ Error clearing analysis data:", error);
    throw error;
  }
}

clearAnalysis()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
