import { NextRequest, NextResponse } from "next/server";
import { createTwelveLabsClient } from "@/lib/twelvelabs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ indexId: string }> }
) {
  try {
    const { indexId } = await params;
    const twelveLabsClient = createTwelveLabsClient();
    const videos = await twelveLabsClient.listVideos(indexId);

    return NextResponse.json({
      videos,
    });
  } catch (error: unknown) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch videos",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
