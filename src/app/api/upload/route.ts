import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { videos } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // In a real implementation, you would:
    // 1. Upload file to storage (S3, Cloudinary, etc.)
    // 2. Get public URL for the video
    // 3. Pass URL to Twelve Labs for processing

    // For now, we'll create a database record
    const [video] = await db
      .insert(videos)
      .values({
        filename: file.name,
        status: "processing",
      })
      .returning();

    return NextResponse.json({
      videoId: video.id,
      status: "processing",
      message: "Video uploaded successfully",
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload video",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
