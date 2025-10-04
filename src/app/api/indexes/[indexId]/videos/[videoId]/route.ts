import { NextRequest, NextResponse } from "next/server";
import { createTwelveLabsClient } from "@/lib/twelvelabs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ indexId: string; videoId: string }> }
) {
  try {
    const { indexId, videoId } = await params;
    const twelveLabsClient = createTwelveLabsClient();
    const video = await twelveLabsClient.getVideo(indexId, videoId);

    return NextResponse.json({
      video,
    });
  } catch (error: unknown) {
    console.error("Error fetching video:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch video",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
