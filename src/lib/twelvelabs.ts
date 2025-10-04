import axios from "axios";

const TWELVE_LABS_API_URL = "https://api.twelvelabs.io/v1.2";

export interface TwelveLabsVideo {
  _id: string;
  hls_url?: string;
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
      const response = await axios.post(
        `${TWELVE_LABS_API_URL}/indexes`,
        {
          index_name: indexName,
          engines: [
            {
              name: "marengo2.7",
              options: ["visual", "conversation", "text_in_video", "logo"],
            },
          ],
        },
        { headers: this.getHeaders() }
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
      const response = await axios.post(
        `${TWELVE_LABS_API_URL}/tasks`,
        {
          index_id: indexId,
          video_url: videoUrl,
        },
        { headers: this.getHeaders() }
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
      const response = await axios.post(
        `${TWELVE_LABS_API_URL}/search`,
        {
          index_id: indexId,
          query_text: query,
          search_options: ["visual", "conversation", "text_in_video"],
          ...(videoId && { filter: { id: videoId } }),
        },
        { headers: this.getHeaders() }
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
      const response = await axios.post(
        `${TWELVE_LABS_API_URL}/gist`,
        {
          video_id: videoId,
          types,
        },
        { headers: this.getHeaders() }
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

  async analyzeForAdMoments(
    indexId: string,
    videoId: string
  ): Promise<AdMoment[]> {
    // Use semantic search to find key moments
    const queries = [
      "exciting moment or announcement",
      "product mention or recommendation",
      "beginning of new topic or segment",
      "emotional peak or highlight",
      "educational explanation or tutorial",
    ];

    const allMoments: AdMoment[] = [];

    for (const query of queries) {
      try {
        const results = await this.searchVideo(indexId, query, videoId);

        if (results.data && results.data.length > 0) {
          results.data
            .slice(0, 3)
            .forEach((result: Record<string, unknown>) => {
              const metadata = Array.isArray(result.metadata)
                ? result.metadata[0]
                : undefined;
              allMoments.push({
                start: (result.start as number) || 0,
                end: (result.end as number) || 0,
                text:
                  metadata && typeof metadata === "object" && "text" in metadata
                    ? (metadata.text as string)
                    : query,
                confidence: (result.confidence as number) || 80,
                emotion: this.detectEmotion(
                  metadata && typeof metadata === "object" && "text" in metadata
                    ? (metadata.text as string)
                    : ""
                ),
                category: this.categorizeContent(query),
              });
            });
        }
      } catch (error) {
        console.error(`Error analyzing for query "${query}":`, error);
      }
    }

    // Sort by start time and remove duplicates
    return this.deduplicateMoments(allMoments);
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
    if (query.includes("educational") || query.includes("tutorial"))
      return "educational";
    if (query.includes("product")) return "product";
    if (query.includes("emotional")) return "lifestyle";
    if (query.includes("exciting")) return "entertainment";
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
