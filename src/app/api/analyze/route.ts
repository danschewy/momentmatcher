import { NextRequest, NextResponse } from "next/server";
import { createTwelveLabsClient } from "@/lib/twelvelabs";
import { createOpenAISearchClient } from "@/lib/openai-search";
import { db } from "@/lib/db";
import { videos, adMoments, adRecommendations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { videoId, indexId } = await request.json();

    if (!videoId) {
      return NextResponse.json({ error: "Video ID required" }, { status: 400 });
    }

    // Get video from database
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, videoId));

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Initialize clients
    const twelveLabsClient = createTwelveLabsClient();
    const openAIClient = createOpenAISearchClient();

    // Analyze video for ad moments using Twelve Labs
    const moments = await twelveLabsClient.analyzeForAdMoments(
      indexId,
      videoId
    );

    // Process each moment
    const processedMoments = [];

    for (const moment of moments) {
      // Save moment to database
      const [savedMoment] = await db
        .insert(adMoments)
        .values({
          videoId: video.id,
          startTime: moment.start,
          endTime: moment.end,
          context: moment.text,
          emotionalTone: moment.emotion || "neutral",
          category: moment.category || "general",
          confidence: moment.confidence,
        })
        .returning();

      // Get ad recommendations from OpenAI
      const recommendations = await openAIClient.findRelevantProducts(
        moment.text,
        moment.emotion || "neutral",
        moment.category || "general"
      );

      // Save recommendations to database
      const savedRecommendations: (typeof adRecommendations.$inferSelect)[] =
        [];
      for (const rec of recommendations.slice(0, 3)) {
        const [savedRec] = await db
          .insert(adRecommendations)
          .values({
            momentId: savedMoment.id,
            productName: rec.productName,
            brandName: rec.brandName,
            description: rec.description,
            productUrl: rec.productUrl,
            reasoning: rec.reasoning,
            relevanceScore: rec.relevanceScore,
            selected: savedRecommendations.length === 0, // Auto-select first recommendation
          })
          .returning();

        savedRecommendations.push(savedRec);
      }

      processedMoments.push({
        ...savedMoment,
        recommendations: savedRecommendations,
      });
    }

    // Update video status
    await db
      .update(videos)
      .set({ status: "completed" })
      .where(eq(videos.id, videoId));

    return NextResponse.json({
      success: true,
      moments: processedMoments,
    });
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze video",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
