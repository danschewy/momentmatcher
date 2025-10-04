import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adMoments, adRecommendations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;

    // Get all moments for this video
    const moments = await db
      .select()
      .from(adMoments)
      .where(eq(adMoments.videoId, videoId));

    // Get recommendations for each moment
    const momentsWithRecs = await Promise.all(
      moments.map(async (moment) => {
        const recs = await db
          .select()
          .from(adRecommendations)
          .where(eq(adRecommendations.momentId, moment.id));

        return {
          ...moment,
          recommendations: recs,
        };
      })
    );

    return NextResponse.json({
      moments: momentsWithRecs,
    });
  } catch (error: unknown) {
    console.error("Error fetching moments:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch moments",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
