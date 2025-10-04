import { NextRequest, NextResponse } from "next/server";
import { createTwelveLabsClient } from "@/lib/twelvelabs";
import { createOpenAISearchClient } from "@/lib/openai-search";
import { db } from "@/lib/db";
import { videos, adMoments, adRecommendations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { videoId, indexId } = await request.json();

    if (!videoId || !indexId) {
      return NextResponse.json(
        { error: "Video ID and Index ID required" },
        { status: 400 }
      );
    }

    console.log(`Analyzing video ${videoId} in index ${indexId}`);

    // Check if we have this video in our database
    let dbVideo = await db
      .select()
      .from(videos)
      .where(eq(videos.id, videoId))
      .limit(1);

    // Check if video is already analyzed
    if (dbVideo.length > 0 && dbVideo[0].status === "completed") {
      console.log("Video already analyzed, retrieving existing moments...");

      // Fetch existing moments with recommendations
      const existingMoments = await db.query.adMoments.findMany({
        where: eq(adMoments.videoId, videoId),
        with: {
          recommendations: true,
        },
      });

      // Transform to match expected format
      const transformedMoments = existingMoments.map((moment) => ({
        id: moment.id,
        startTime: moment.startTime,
        endTime: moment.endTime,
        context: moment.context,
        emotionalTone: moment.emotionalTone || "neutral",
        category: moment.category || "general",
        confidence: moment.confidence || 0,
        clipUrl: moment.clipUrl || "",
        thumbnailUrl: moment.thumbnailUrl || "",
        recommendations: (moment.recommendations || []).map((rec) => ({
          id: rec.id,
          momentId: rec.momentId,
          productName: rec.productName,
          brandName: rec.brandName || "",
          description: rec.description || "",
          productUrl: rec.productUrl || "",
          imageUrl: "",
          reasoning: rec.reasoning || "",
          relevanceScore: rec.relevanceScore || 0,
          selected: rec.selected || false,
        })),
      }));

      return NextResponse.json({
        success: true,
        cached: true,
        moments: transformedMoments,
      });
    }

    if (dbVideo.length === 0) {
      // Create video record with Twelve Labs video ID
      console.log(`Creating new video record for ${videoId}`);
      const [newVideo] = await db
        .insert(videos)
        .values({
          id: videoId,
          filename: `Video ${videoId}`,
          status: "processing",
        })
        .returning();
      dbVideo = [newVideo];
    }

    // Initialize clients
    const twelveLabsClient = createTwelveLabsClient();
    const openAIClient = createOpenAISearchClient();

    // Analyze video for ad moments using Twelve Labs
    console.log(
      `Starting analysis for video ${videoId} in index ${indexId}...`
    );
    const moments = await twelveLabsClient.analyzeForAdMoments(
      indexId,
      videoId
    );

    console.log(`Found ${moments.length} moments from Twelve Labs`);
    if (moments.length === 0) {
      console.warn("No moments found! This might indicate:");
      console.warn("1. The video content doesn't match any search queries");
      console.warn("2. The video is too short or has no analyzable content");
      console.warn("3. The Twelve Labs search is not returning results");
    } else {
      console.log(
        "Moment details:",
        moments.map((m) => ({
          start: m.start,
          end: m.end,
          text: m.text.substring(0, 100),
          confidence: m.confidence,
          emotion: m.emotion,
          category: m.category,
        }))
      );
    }

    // Process each moment
    const processedMoments = [];

    for (const moment of moments) {
      console.log(`Processing moment: ${moment.text.substring(0, 50)}...`);

      // Generate clip and get transcript for this moment
      console.log(
        `Generating clip for moment ${moment.start}-${moment.end}...`
      );
      const { clipUrl, thumbnailUrl, transcript } =
        await twelveLabsClient.generateClip(
          indexId,
          videoId,
          moment.start,
          moment.end
        );

      console.log(`Transcript for moment: ${transcript.substring(0, 100)}...`);

      // Save moment to database (round times to integers)
      console.log(`Saving moment to database...`);
      const [savedMoment] = await db
        .insert(adMoments)
        .values({
          videoId: dbVideo[0].id,
          startTime: Math.floor(moment.start),
          endTime: Math.ceil(moment.end),
          context: moment.text,
          emotionalTone: moment.emotion || "neutral",
          category: moment.category || "general",
          confidence: moment.confidence,
          clipUrl: clipUrl || null,
          thumbnailUrl: thumbnailUrl || null,
        })
        .returning();

      console.log(`✅ Moment saved with ID: ${savedMoment.id}`);
      console.log(`   Video ID: ${savedMoment.videoId}`);
      console.log(
        `   Time: ${savedMoment.startTime}s - ${savedMoment.endTime}s`
      );

      if (!savedMoment || !savedMoment.id) {
        console.error("❌ Failed to save moment - no ID returned!");
        continue; // Skip to next moment
      }

      // Get ad recommendations from OpenAI with transcript
      console.log(`Getting recommendations for moment ${savedMoment.id}...`);
      const contextWithTranscript = transcript
        ? `${moment.text}\n\nTranscript: ${transcript}`
        : moment.text;

      const recommendations = await openAIClient.findRelevantProducts(
        contextWithTranscript,
        moment.emotion || "neutral",
        moment.category || "general"
      );

      // Save recommendations to database
      console.log(
        `Saving ${recommendations.length} recommendations for moment...`
      );
      const savedRecommendations: (typeof adRecommendations.$inferSelect)[] =
        [];
      for (const rec of recommendations.slice(0, 3)) {
        try {
          console.log(
            `Saving recommendation: ${rec.productName} (${rec.relevanceScore}% match)`
          );
          console.log(`   Moment ID: ${savedMoment.id}`);
          console.log(`   Data to insert:`, {
            momentId: savedMoment.id,
            productName: rec.productName,
            brandName: rec.brandName || null,
            description: rec.description || null,
            productUrl: rec.productUrl || null,
            imageUrl: rec.imageUrl || null,
            reasoning: rec.reasoning || null,
            relevanceScore: rec.relevanceScore || 0,
            selected: savedRecommendations.length === 0,
          });

          const [savedRec] = await db
            .insert(adRecommendations)
            .values({
              momentId: savedMoment.id,
              productName: rec.productName,
              brandName: rec.brandName || null,
              description: rec.description || null,
              productUrl: rec.productUrl || null,
              imageUrl: rec.imageUrl || null,
              reasoning: rec.reasoning || null,
              relevanceScore: rec.relevanceScore || 0,
              selected: savedRecommendations.length === 0, // Auto-select first recommendation
            })
            .returning();
          console.log(`✅ Saved recommendation with ID: ${savedRec.id}`);

          savedRecommendations.push({
            id: savedRec.id,
            momentId: savedRec.momentId,
            productName: savedRec.productName,
            brandName: savedRec.brandName || "",
            description: savedRec.description || "",
            productUrl: savedRec.productUrl || "",
            imageUrl: "",
            reasoning: savedRec.reasoning || "",
            relevanceScore: savedRec.relevanceScore || 0,
            selected: savedRec.selected || false,
          });
        } catch (insertError: unknown) {
          console.error(
            `❌ Failed to save recommendation "${rec.productName}":`,
            insertError
          );
          console.error(
            "Error details:",
            insertError instanceof Error ? insertError.message : "Unknown error"
          );
          console.error(
            "Stack:",
            insertError instanceof Error ? insertError.stack : "No stack"
          );
        }
      }

      processedMoments.push({
        id: savedMoment.id,
        startTime: savedMoment.startTime,
        endTime: savedMoment.endTime,
        context: savedMoment.context,
        emotionalTone: savedMoment.emotionalTone || "neutral",
        category: savedMoment.category || "general",
        confidence: savedMoment.confidence || 0,
        clipUrl: savedMoment.clipUrl || "",
        thumbnailUrl: savedMoment.thumbnailUrl || "",
        recommendations: savedRecommendations,
      });
    }

    // Update video status
    await db
      .update(videos)
      .set({ status: "completed" })
      .where(eq(videos.id, dbVideo[0].id));

    console.log(
      `Analysis complete, returning ${processedMoments.length} moments`
    );

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
