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
    const twelveLabsClient = createTwelveLabsClient();

    // Get video from database
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, videoId))
      .limit(1);

    // If video doesn't exist in DB, check Twelve Labs directly
    if (!video) {
      console.log(`Video ${videoId} not in DB, checking Twelve Labs...`);

      // Get index ID from env or fetch first available
      let indexId = process.env.TWELVE_LABS_INDEX_ID;
      if (!indexId) {
        const indexes = await twelveLabsClient.listIndexes();
        if (indexes.length > 0) {
          indexId = indexes[0]._id;
        }
      }

      if (!indexId) {
        return NextResponse.json(
          { error: "No Twelve Labs index found" },
          { status: 404 }
        );
      }

      try {
        // Check if video exists in Twelve Labs
        const tlVideo = await twelveLabsClient.getVideo(indexId, videoId);

        // Video exists in Twelve Labs but not in DB - add it
        if (tlVideo) {
          console.log(`Found video in Twelve Labs, adding to DB...`);
          await db.insert(videos).values({
            id: videoId,
            filename: tlVideo.metadata?.filename || "Unknown Video",
            status: "completed", // If we can fetch it, it's ready
            videoUrl: null,
          });

          return NextResponse.json({
            videoId: videoId,
            status: "completed",
            filename: tlVideo.metadata?.filename || "Unknown Video",
            message: "Video ready in Twelve Labs",
          });
        }
      } catch (error) {
        console.error("Video not found in Twelve Labs either:", error);
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
      }
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
    if (video.status === "processing") {
      if (video.twelveLabs) {
        const twelveLabsData = video.twelveLabs as {
          taskId: string;
          indexId: string;
        };

        try {
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
        } catch (taskError) {
          console.warn(
            `Could not get task status, checking video directly:`,
            taskError
          );
          // Fall through to check video directly
        }
      }

      // If no taskId or task check failed, try checking video directly in Twelve Labs
      let indexId = process.env.TWELVE_LABS_INDEX_ID;
      if (!indexId) {
        const indexes = await twelveLabsClient.listIndexes();
        if (indexes.length > 0) {
          indexId = indexes[0]._id;
        }
      }

      if (indexId) {
        try {
          const tlVideo = await twelveLabsClient.getVideo(indexId, videoId);
          if (tlVideo) {
            // Video is ready in Twelve Labs, update DB
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
        } catch (videoError) {
          console.warn(`Could not fetch video from Twelve Labs:`, videoError);
        }
      }

      // If all checks failed, return processing status
      return NextResponse.json({
        videoId: video.id,
        status: "processing",
        filename: video.filename,
        message: "Video is still being indexed...",
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
