import { NextRequest, NextResponse } from "next/server";
import { createTwelveLabsClient } from "@/lib/twelvelabs";
import { db } from "@/lib/db";
import { videos } from "@/lib/db/schema";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const videoUrl = formData.get("videoUrl") as string; // Optional: pre-uploaded URL

    if (!file && !videoUrl) {
      return NextResponse.json(
        { error: "No file or video URL provided" },
        { status: 400 }
      );
    }

    const twelveLabsClient = createTwelveLabsClient();
    let indexId = process.env.TWELVE_LABS_INDEX_ID;

    // Get or create index
    if (!indexId) {
      console.log(
        "No TWELVE_LABS_INDEX_ID in environment, fetching indexes..."
      );
      const indexes = await twelveLabsClient.listIndexes();
      console.log(`Found ${indexes.length} indexes`);

      if (indexes.length > 0) {
        indexId = indexes[0]._id;
        console.log(
          `Using existing index: ${indexId} (${indexes[0].index_name})`
        );
      } else {
        console.log("No indexes found, creating new one...");
        const newIndex = await twelveLabsClient.createIndex(
          "momentmatch-videos"
        );
        indexId = newIndex._id;
        console.log(`Created new index: ${indexId}`);
      }
    } else {
      console.log(`Using index from environment: ${indexId}`);
    }

    if (!indexId) {
      throw new Error("Failed to get or create Twelve Labs index");
    }

    let uploadTask;

    if (file) {
      // Direct file upload to Twelve Labs
      console.log(
        `Uploading file to Twelve Labs: ${file.name} (${file.size} bytes)`
      );
      uploadTask = await twelveLabsClient.uploadVideoFile(file, indexId);
    } else {
      // Upload from URL
      console.log(`Uploading video from URL to Twelve Labs: ${videoUrl}`);
      uploadTask = await twelveLabsClient.uploadVideo(videoUrl, indexId);
    }
    console.log(`Upload task created: ${uploadTask._id}`);

    // Check initial status
    const taskStatus = await twelveLabsClient.getTaskStatus(uploadTask._id);
    console.log(`Initial task status: ${taskStatus.status}`);

    // Save video to database with processing status
    // We'll let the client poll for status updates instead of blocking here
    const [video] = await db
      .insert(videos)
      .values({
        id: uploadTask.video_id,
        filename: file?.name || videoUrl?.split("/").pop() || "Uploaded video",
        status: taskStatus.status === "ready" ? "completed" : "processing",
        videoUrl: videoUrl || null,
        twelveLabs: {
          taskId: uploadTask._id,
          indexId,
        },
      })
      .returning();

    return NextResponse.json({
      videoId: video.id,
      indexId,
      taskId: uploadTask._id,
      status: taskStatus.status,
      message:
        taskStatus.status === "ready"
          ? "Video uploaded and indexed successfully"
          : "Video upload initiated. Indexing in progress...",
      estimatedTime: "1-5 minutes depending on video length",
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);

    // Handle specific Twelve Labs authorization errors
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      const errorData = error.response?.data;
      return NextResponse.json(
        {
          error: "Authorization Error",
          details:
            errorData?.message ||
            "Your API key doesn't have permission to upload to this index",
          hint: "Please check your TWELVE_LABS_API_KEY and TWELVE_LABS_INDEX_ID in your .env file. You may need to create a new index or use a different API key with proper permissions.",
          twelveLabsError: errorData,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to upload video",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
