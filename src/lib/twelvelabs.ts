import axios from "axios";

const TWELVE_LABS_API_URL = "https://api.twelvelabs.io/v1.3";

export interface TwelveLabsVideo {
  _id: string;
  created_at: string;
  duration: number;
  status: string;
  metadata?: {
    filename?: string;
    duration?: number;
    fps?: number;
    width?: number;
    height?: number;
  };
  hls?: {
    video_url: string;
    thumbnail_urls?: string[];
    status: string;
    updated_at: string;
  };
}

export interface TwelveLabsIndex {
  _id: string;
  index_name: string;
  engines: Array<{
    name: string;
    options: string[];
  }>;
  video_count?: number;
  created_at: string;
}

export interface AdMoment {
  start: number;
  end: number;
  text: string;
  confidence: number;
  emotion?: string;
  category?: string;
}

class TwelveLabsClient {
  private apiKey: string;
  private indexId: string | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      "x-api-key": this.apiKey,
      "Content-Type": "application/json",
    };
  }

  async listIndexes(): Promise<TwelveLabsIndex[]> {
    try {
      const response = await axios.get(`${TWELVE_LABS_API_URL}/indexes`, {
        headers: this.getHeaders(),
      });
      return response.data.data || [];
    } catch (error: unknown) {
      const errorData = axios.isAxiosError(error)
        ? error.response?.data
        : undefined;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error listing indexes:", errorData || errorMessage);
      throw error;
    }
  }

  async getIndex(indexId: string): Promise<TwelveLabsIndex> {
    try {
      const response = await axios.get(
        `${TWELVE_LABS_API_URL}/indexes/${indexId}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: unknown) {
      const errorData = axios.isAxiosError(error)
        ? error.response?.data
        : undefined;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error getting index:", errorData || errorMessage);
      throw error;
    }
  }

  async createIndex(indexName: string = "momentmatch-videos") {
    try {
      const formData = new FormData();
      formData.append("index_name", indexName);
      formData.append(
        "engines",
        JSON.stringify([
          {
            name: "marengo2.7",
            options: ["visual", "audio"],
          },
        ])
      );

      const response = await axios.post(
        `${TWELVE_LABS_API_URL}/indexes`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            "Content-Type": "multipart/form-data",
          },
        }
      );
      this.indexId = response.data._id;
      return response.data;
    } catch (error: unknown) {
      const errorData = axios.isAxiosError(error)
        ? error.response?.data
        : undefined;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error creating index:", errorData || errorMessage);
      throw error;
    }
  }

  async uploadVideo(videoUrl: string, indexId: string) {
    try {
      const formData = new FormData();
      formData.append("index_id", indexId);
      formData.append("video_url", videoUrl);
      formData.append("enable_video_stream", "true");
      const response = await axios.post(
        `${TWELVE_LABS_API_URL}/tasks`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorData = axios.isAxiosError(error)
        ? error.response?.data
        : undefined;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error uploading video:", errorData || errorMessage);
      throw error;
    }
  }

  async uploadVideoFile(file: File, indexId: string) {
    try {
      const formData = new FormData();
      formData.append("index_id", indexId);
      formData.append("video_file", file);
      formData.append("enable_video_stream", "true");

      const response = await axios.post(
        `${TWELVE_LABS_API_URL}/tasks`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            "Content-Type": "multipart/form-data",
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorData = axios.isAxiosError(error)
        ? error.response?.data
        : undefined;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error uploading video file:", errorData || errorMessage);
      throw error;
    }
  }

  async getTaskStatus(taskId: string) {
    try {
      const response = await axios.get(
        `${TWELVE_LABS_API_URL}/tasks/${taskId}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: unknown) {
      const errorData = axios.isAxiosError(error)
        ? error.response?.data
        : undefined;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error getting task status:", errorData || errorMessage);
      throw error;
    }
  }

  async listVideos(indexId: string): Promise<TwelveLabsVideo[]> {
    try {
      const response = await axios.get(
        `${TWELVE_LABS_API_URL}/indexes/${indexId}/videos`,
        { headers: this.getHeaders() }
      );
      return response.data.data || [];
    } catch (error: unknown) {
      const errorData = axios.isAxiosError(error)
        ? error.response?.data
        : undefined;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error listing videos:", errorData || errorMessage);
      throw error;
    }
  }

  async getVideo(indexId: string, videoId: string): Promise<TwelveLabsVideo> {
    try {
      const response = await axios.get(
        `${TWELVE_LABS_API_URL}/indexes/${indexId}/videos/${videoId}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: unknown) {
      const errorData = axios.isAxiosError(error)
        ? error.response?.data
        : undefined;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error getting video:", errorData || errorMessage);
      throw error;
    }
  }

  async searchVideo(indexId: string, query: string, videoId?: string) {
    try {
      const formData = new FormData();
      formData.append("index_id", indexId);
      formData.append("query_text", query);
      formData.append("search_options", "visual");
      formData.append("search_options", "audio");

      if (videoId) {
        formData.append("filter", JSON.stringify({ id: [videoId] }));
      }

      const response = await axios.post(
        `${TWELVE_LABS_API_URL}/search`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorData = axios.isAxiosError(error)
        ? error.response?.data
        : undefined;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error searching video:", errorData || errorMessage);
      throw error;
    }
  }

  async generateGist(videoId: string, types: string[] = ["topic", "hashtag"]) {
    try {
      const formData = new FormData();
      formData.append("video_id", videoId);
      formData.append("types", JSON.stringify(types));

      const response = await axios.post(
        `${TWELVE_LABS_API_URL}/gist`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const errorData = axios.isAxiosError(error)
        ? error.response?.data
        : undefined;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error generating gist:", errorData || errorMessage);
      throw error;
    }
  }

  async analyzeForBrandMentions(videoId: string): Promise<
    {
      timestamp: string;
      timeInSeconds: number;
      description: string;
      type: "brand_mention" | "ad_opportunity";
    }[]
  > {
    try {
      console.log(
        "🎯 Calling Twelve Labs Analyze endpoint for brand analysis..."
      );

      const response = await axios.post(
        `${TWELVE_LABS_API_URL}/analyze`,
        {
          video_id: videoId,
          prompt: `Analyze this video and identify ALL moments where:
1. Brands, products, or services are explicitly mentioned by name
2. Products or services are shown or demonstrated
3. High-energy, exciting moments that would be ideal for advertisements
4. Emotional peaks (positive excitement, inspiration, motivation)
5. Moments discussing problems that products could solve

For each moment, provide the exact timestamp in MM:SS format, a clear description of what's happening and why it's relevant for advertising, and classify it as either a "brand_mention" (for explicit brand/product mentions) or "ad_opportunity" (for high-energy moments ideal for ads).

Be thorough and identify as many relevant moments as possible.`,
          temperature: 0.3,
          stream: false,
          response_format: {
            type: "json_schema",
            json_schema: {
              type: "object",
              properties: {
                moments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      timestamp: {
                        type: "string",
                        description: "Timestamp in MM:SS format",
                      },
                      description: {
                        type: "string",
                        description: "Detailed description of the moment",
                      },
                      type: {
                        type: "string",
                        enum: ["brand_mention", "ad_opportunity"],
                        description: "Type of moment",
                      },
                    },
                    required: ["timestamp", "description", "type"],
                  },
                },
              },
              required: ["moments"],
            },
          },
          max_tokens: 4000,
        },
        {
          headers: {
            ...this.getHeaders(),
            "Content-Type": "application/json",
          },
        }
      );

      const responseData = response.data.data;
      console.log("📝 Raw response:", responseData);

      // Parse the JSON response
      const parsed =
        typeof responseData === "string"
          ? JSON.parse(responseData)
          : responseData;

      const moments = parsed.moments || [];

      console.log(
        `✅ Found ${moments.length} brand/ad moments from AI analysis`
      );

      // Convert timestamps to seconds and ensure proper structure
      return moments.map((moment: Record<string, unknown>) => {
        const timestamp = (moment.timestamp as string) || "0:00";
        const [minutes, seconds] = timestamp.split(":").map(Number);
        return {
          timestamp,
          timeInSeconds: minutes * 60 + seconds,
          description: (moment.description as string) || "",
          type:
            (moment.type as "brand_mention" | "ad_opportunity") ||
            "ad_opportunity",
        };
      });
    } catch (error: unknown) {
      const errorData = axios.isAxiosError(error)
        ? error.response?.data
        : undefined;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(
        "Error analyzing for brand mentions:",
        errorData || errorMessage
      );
      // Return empty array instead of throwing to not break the entire analysis
      return [];
    }
  }

  async getTranscript(
    indexId: string,
    videoId: string,
    startTime?: number,
    endTime?: number
  ): Promise<string> {
    try {
      const video = await this.getVideo(indexId, videoId);

      // Get transcription with query parameter
      const response = await axios.get(
        `${TWELVE_LABS_API_URL}/indexes/${indexId}/videos/${videoId}`,
        {
          params: { transcription: true },
          headers: this.getHeaders(),
        }
      );

      const transcription = response.data.transcription || [];

      // Filter by time range if specified
      if (startTime !== undefined && endTime !== undefined) {
        const filtered = transcription.filter(
          (segment: { start: number; end: number; value: string }) => {
            return segment.start < endTime && segment.end > startTime;
          }
        );
        return filtered.map((s: { value: string }) => s.value).join(" ");
      }

      return transcription.map((s: { value: string }) => s.value).join(" ");
    } catch (error: unknown) {
      console.error("Error getting transcript:", error);
      return "";
    }
  }

  async generateClip(
    indexId: string,
    videoId: string,
    startTime: number,
    endTime: number
  ): Promise<{ clipUrl: string; thumbnailUrl: string; transcript: string }> {
    try {
      // Get video and transcript
      const video = await this.getVideo(indexId, videoId);
      const transcript = await this.getTranscript(
        indexId,
        videoId,
        startTime,
        endTime
      );

      if (video.hls?.video_url) {
        // HLS supports time-based fragments
        const clipUrl = `${video.hls.video_url}#t=${startTime},${endTime}`;
        const thumbnailUrl = video.hls.thumbnail_urls?.[0] || "";

        return { clipUrl, thumbnailUrl, transcript };
      }

      return { clipUrl: "", thumbnailUrl: "", transcript };
    } catch (error: unknown) {
      console.error("Error generating clip:", error);
      return { clipUrl: "", thumbnailUrl: "", transcript: "" };
    }
  }

  async analyzeForAdMoments(
    indexId: string,
    videoId: string
  ): Promise<AdMoment[]> {
    // Use semantic search to find key moments for ad placement
    const queries = [
      // "product mention, review, or recommendation",
      // "travel destination or location showcase",
      // "service or tool demonstration",
      // "lifestyle or wellness moment",
      // "technology or gadget feature",
      // "food, dining, or cooking segment",
      // "fashion, style, or beauty content",
      // "fitness, sports, or exercise activity",
      // "entertainment or cultural event",
      // "educational explanation or tutorial",
      // "problem solution or life hack",
      "product mention, review, or recommendation",
      "technology or gadget feature",
      "service or tool demonstration",
      "fashion, style, or beauty content",
      "food, dining, or cooking segment",
    ];

    const allMoments: AdMoment[] = [];

    for (const query of queries) {
      try {
        console.log(`🔍 Searching for: "${query}"`);
        const results = await this.searchVideo(indexId, query, videoId);

        console.log(
          `   Results for "${query}": ${results.data?.length || 0} matches`
        );

        if (results.data && results.data.length > 0) {
          console.log(
            `   Processing top ${Math.min(3, results.data.length)} results...`
          );
          results.data
            .slice(0, 3)
            .forEach((result: Record<string, unknown>, idx: number) => {
              const metadata = Array.isArray(result.metadata)
                ? result.metadata[0]
                : undefined;

              const momentText =
                metadata && typeof metadata === "object" && "text" in metadata
                  ? (metadata.text as string)
                  : query;

              console.log(
                `   ✓ Moment ${idx + 1}: ${(result.start as number)?.toFixed(
                  1
                )}s - ${momentText.substring(0, 80)}...`
              );

              allMoments.push({
                start: (result.start as number) || 0,
                end: (result.end as number) || 0,
                text: momentText,
                confidence: this.convertConfidence(result.confidence),
                emotion: this.detectEmotion(
                  metadata && typeof metadata === "object" && "text" in metadata
                    ? (metadata.text as string)
                    : ""
                ),
                category: this.categorizeContent(query),
              });
            });
        } else {
          console.log(`   ⚠️  No results for "${query}"`);
        }
      } catch (error) {
        console.error(`❌ Error analyzing for query "${query}":`, error);
      }
    }

    console.log(
      `\n📊 Total moments found before deduplication: ${allMoments.length}`
    );

    // Sort by start time and remove duplicates
    return this.deduplicateMoments(allMoments);
  }

  private convertConfidence(confidence: unknown): number {
    // Twelve Labs returns confidence as string ("low", "medium", "high")
    // or as a number - convert to integer 0-100
    if (typeof confidence === "number") {
      return Math.round(confidence);
    }

    if (typeof confidence === "string") {
      const lower = confidence.toLowerCase();
      if (lower === "high" || lower === "h") return 90;
      if (lower === "medium" || lower === "mid" || lower === "m") return 70;
      if (lower === "low" || lower === "l") return 50;
    }

    // Default fallback
    return 75;
  }

  private detectEmotion(text: string): string {
    const lowerText = text.toLowerCase();
    if (lowerText.match(/excit|amazing|awesome|great|wonderful/))
      return "excited";
    if (lowerText.match(/sad|disappoint|unfortunate/)) return "negative";
    if (lowerText.match(/happy|joy|fun|love/)) return "positive";
    return "neutral";
  }

  private categorizeContent(query: string): string {
    const lower = query.toLowerCase();

    // Product & Services
    if (lower.includes("product") || lower.includes("review")) return "product";
    if (lower.includes("service") || lower.includes("tool"))
      return "productivity";

    // Travel & Location
    if (
      lower.includes("travel") ||
      lower.includes("destination") ||
      lower.includes("location")
    )
      return "travel";

    // Lifestyle Categories
    if (lower.includes("lifestyle") || lower.includes("wellness"))
      return "lifestyle";
    if (
      lower.includes("food") ||
      lower.includes("dining") ||
      lower.includes("cooking")
    )
      return "food";
    if (
      lower.includes("fashion") ||
      lower.includes("style") ||
      lower.includes("beauty")
    )
      return "fashion";
    if (
      lower.includes("fitness") ||
      lower.includes("sports") ||
      lower.includes("exercise")
    )
      return "fitness";

    // Technology & Education
    if (lower.includes("technology") || lower.includes("gadget"))
      return "technology";
    if (
      lower.includes("educational") ||
      lower.includes("tutorial") ||
      lower.includes("explanation")
    )
      return "educational";

    // Entertainment & Inspiration
    if (lower.includes("entertainment") || lower.includes("cultural"))
      return "entertainment";
    if (lower.includes("inspirational") || lower.includes("motivational"))
      return "lifestyle";
    if (
      lower.includes("problem") ||
      lower.includes("solution") ||
      lower.includes("hack")
    )
      return "productivity";

    return "general";
  }

  private deduplicateMoments(moments: AdMoment[]): AdMoment[] {
    const sorted = moments.sort((a, b) => a.start - b.start);
    const deduplicated: AdMoment[] = [];

    for (const moment of sorted) {
      const hasOverlap = deduplicated.some(
        (existing) =>
          (moment.start >= existing.start && moment.start <= existing.end) ||
          (moment.end >= existing.start && moment.end <= existing.end)
      );

      if (!hasOverlap) {
        deduplicated.push(moment);
      }
    }

    return deduplicated;
  }
}

export const createTwelveLabsClient = () => {
  const apiKey = process.env.TWELVE_LABS_API_KEY;
  if (!apiKey) {
    throw new Error("TWELVE_LABS_API_KEY is not set");
  }
  return new TwelveLabsClient(apiKey);
};
