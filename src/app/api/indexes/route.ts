import { NextResponse } from "next/server";
import { createTwelveLabsClient } from "@/lib/twelvelabs";

export async function GET() {
  try {
    const twelveLabsClient = createTwelveLabsClient();
    const indexes = await twelveLabsClient.listIndexes();

    return NextResponse.json({
      indexes,
    });
  } catch (error: unknown) {
    console.error("Error fetching indexes:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch indexes",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
