import { NextRequest, NextResponse } from "next/server";
import { createTwelveLabsClient } from "@/lib/twelvelabs";
import { db } from "@/lib/db";
import { videos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;

    // Get video from database
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, videoId))
      .limit(1);

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // If already completed, return status
    if (video.status === "completed") {
      return NextResponse.json({
        videoId: video.id,
        status: "completed",
        filename: video.filename,
        message: "Video indexing complete",
      });
    }

    // If processing, check Twelve Labs task status
    if (video.status === "processing" && video.twelveLabs) {
      const twelveLabsData = video.twelveLabs as {
        taskId: string;
        indexId: string;
      };

      const twelveLabsClient = createTwelveLabsClient();
      const taskStatus = await twelveLabsClient.getTaskStatus(
        twelveLabsData.taskId
      );

      console.log(`Video ${videoId} task status: ${taskStatus.status}`);

      // Update database if status changed
      if (taskStatus.status === "ready") {
        await db
          .update(videos)
          .set({ status: "completed" })
          .where(eq(videos.id, videoId));

        return NextResponse.json({
          videoId: video.id,
          status: "completed",
          filename: video.filename,
          message: "Video indexing complete",
        });
      }

      if (taskStatus.status === "failed") {
        await db
          .update(videos)
          .set({ status: "failed" })
          .where(eq(videos.id, videoId));

        return NextResponse.json({
          videoId: video.id,
          status: "failed",
          filename: video.filename,
          message: taskStatus.message || "Video indexing failed",
          error: taskStatus.message,
        });
      }

      // Still processing
      return NextResponse.json({
        videoId: video.id,
        status: "processing",
        filename: video.filename,
        message: "Video is still being indexed...",
        progress: taskStatus.status,
      });
    }

    // Unknown state
    return NextResponse.json({
      videoId: video.id,
      status: video.status,
      filename: video.filename,
      message: "Video status unknown",
    });
  } catch (error: unknown) {
    console.error("Error checking video status:", error);
    return NextResponse.json(
      {
        error: "Failed to check video status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
