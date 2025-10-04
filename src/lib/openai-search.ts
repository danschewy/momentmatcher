import OpenAI from "openai";

export interface ProductRecommendation {
  productName: string;
  brandName: string;
  description: string;
  productUrl: string;
  reasoning: string;
  relevanceScore: number;
}

class OpenAISearchClient {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async findRelevantProducts(
    momentContext: string,
    emotionalTone: string,
    category: string
  ): Promise<ProductRecommendation[]> {
    try {
      const prompt = `Based on the following video moment, recommend 3 relevant products or services that would make great ads:

Video Moment Context: ${momentContext}
Emotional Tone: ${emotionalTone}
Category: ${category}

For each recommendation, provide:
1. Product/Brand Name
2. Brief description
3. Why it's a good fit for this moment
4. Relevance score (0-100)

Format your response as JSON array with this structure:
[{
  "productName": "string",
  "brandName": "string", 
  "description": "string",
  "reasoning": "string",
  "relevanceScore": number
}]`;

      const completion = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an expert advertising strategist who matches products to video content moments. Recommend real, current products and services based on your knowledge.",
          },
          { role: "user", content: prompt },
        ],
        // Note: Web search tool integration requires proper configuration
        // For production, configure web_search tool with your OpenAI account
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      const parsed = JSON.parse(content);
      const recommendations = Array.isArray(parsed)
        ? parsed
        : parsed.recommendations || [];

      return recommendations.map((rec: Record<string, unknown>) => ({
        productName: (rec.productName ||
          rec.product_name ||
          "Unknown Product") as string,
        brandName: (rec.brandName ||
          rec.brand_name ||
          rec.brand ||
          "Unknown Brand") as string,
        description: (rec.description || "") as string,
        productUrl: (rec.productUrl ||
          rec.product_url ||
          rec.url ||
          "#") as string,
        reasoning: (rec.reasoning || "Relevant to content") as string,
        relevanceScore: (rec.relevanceScore ||
          rec.relevance_score ||
          75) as number,
      }));
    } catch (error: unknown) {
      console.error(
        "Error getting product recommendations:",
        error instanceof Error ? error.message : "Unknown error"
      );

      // Fallback to generic recommendations
      return this.getFallbackRecommendations(category, emotionalTone);
    }
  }

  private getFallbackRecommendations(
    category: string,
    _emotionalTone: string
  ): ProductRecommendation[] {
    const fallbackMap: Record<string, ProductRecommendation[]> = {
      educational: [
        {
          productName: "Coursera Plus",
          brandName: "Coursera",
          description:
            "Access 7,000+ courses from top universities and companies",
          productUrl: "https://www.coursera.org",
          reasoning: "Perfect for educational content viewers seeking to learn",
          relevanceScore: 85,
        },
        {
          productName: "Skillshare Premium",
          brandName: "Skillshare",
          description: "Learn creative skills from industry professionals",
          productUrl: "https://www.skillshare.com",
          reasoning: "Appeals to viewers interested in skill development",
          relevanceScore: 82,
        },
      ],
      lifestyle: [
        {
          productName: "Premium Membership",
          brandName: "Nike",
          description:
            "Exclusive access to new products and personalized training",
          productUrl: "https://www.nike.com",
          reasoning: "Matches active lifestyle content",
          relevanceScore: 80,
        },
      ],
      entertainment: [
        {
          productName: "Premium Streaming",
          brandName: "Spotify",
          description: "Ad-free music and podcasts",
          productUrl: "https://www.spotify.com",
          reasoning: "Entertainment content audience overlap",
          relevanceScore: 78,
        },
      ],
    };

    return fallbackMap[category] || fallbackMap.lifestyle || [];
  }
}

export const createOpenAISearchClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAISearchClient(apiKey);
};
