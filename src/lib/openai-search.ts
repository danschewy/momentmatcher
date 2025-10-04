import OpenAI from "openai";

export interface ProductRecommendation {
  productName: string;
  brandName: string;
  description: string;
  productUrl: string;
  imageUrl?: string;
  reasoning: string;
  relevanceScore: number;
  // Revenue projections
  estimatedCPM?: number; // Cost per 1000 impressions
  estimatedCTR?: number; // Click-through rate percentage
  projectedRevenue?: number; // Estimated revenue per placement
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
      console.log("Finding relevant products for:", {
        momentContext,
        emotionalTone,
        category,
      });
      const prompt = `Based on the following video moment, recommend 3 relevant products or services that would make great ads:

Video Moment Context: ${momentContext}
Emotional Tone: ${emotionalTone}
Category: ${category}

For each recommendation, provide:
1. Product/Brand Name
2. Brief description
3. Why it's a good fit for this moment
4. Relevance score (0-100)
5. Estimated CPM (Cost per 1000 impressions) in USD - provide a realistic estimate based on industry standards for this product category
6. Estimated CTR (Click-through rate) as a percentage - provide a realistic estimate based on ad relevance and placement
7. Projected Revenue per placement in USD - calculate this based on: (estimatedCPM * estimatedCTR * 10) as a rough estimate

IMPORTANT: Return your response as a JSON object with a "recommendations" array containing exactly 3 products.

Format your response exactly like this:
{
  "recommendations": [
    {
      "productName": "string",
      "brandName": "string", 
      "description": "string",
      "reasoning": "string",
      "relevanceScore": number,
      "estimatedCPM": number,
      "estimatedCTR": number,
      "projectedRevenue": number
    }
  ]
}`;

      const completion = await this.client.chat.completions.create({
        model: "o4-mini",
        tools: [
          {
            type: "function",
            function: {
              name: "web_search",
              description:
                "Search the web for the most relevant products and services",
            },
          },
        ],
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
      console.log("OpenAI Parsed Response:", JSON.stringify(parsed, null, 2));

      // Handle different response formats
      let recommendations: Record<string, unknown>[] = [];

      if (Array.isArray(parsed)) {
        // Direct array format
        recommendations = parsed;
        console.log("✓ Received array of recommendations");
      } else if (
        parsed.recommendations &&
        Array.isArray(parsed.recommendations)
      ) {
        // Object with recommendations array
        recommendations = parsed.recommendations;
        console.log("✓ Received recommendations in object wrapper");
      } else if (typeof parsed === "object" && parsed.productName) {
        // Single recommendation object - wrap in array
        recommendations = [parsed];
        console.log("⚠️  Received single recommendation, wrapping in array");
      } else {
        console.error("❌ Unexpected response format:", parsed);
        return this.getFallbackRecommendations(category, emotionalTone);
      }

      console.log(
        `Found ${recommendations.length} recommendations from OpenAI`
      );

      if (recommendations.length === 0) {
        console.warn("⚠️  No recommendations found, using fallbacks");
        return this.getFallbackRecommendations(category, emotionalTone);
      }

      const mapped = recommendations.map((rec: Record<string, unknown>) => ({
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
        imageUrl: (rec.imageUrl || rec.image_url || "") as string,
        reasoning: (rec.reasoning || "Relevant to content") as string,
        relevanceScore: (rec.relevanceScore ||
          rec.relevance_score ||
          75) as number,
        estimatedCPM: (rec.estimatedCPM || rec.estimated_cpm || 15) as number,
        estimatedCTR: (rec.estimatedCTR || rec.estimated_ctr || 2.5) as number,
        projectedRevenue: (rec.projectedRevenue ||
          rec.projected_revenue ||
          3.75) as number,
      }));

      console.log(`✅ Mapped ${mapped.length} recommendations successfully`);
      return mapped;
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
          description: "Access 7,000+ courses from top universities",
          productUrl: "https://www.coursera.org",
          reasoning: "Perfect for educational content viewers",
          relevanceScore: 85,
          estimatedCPM: 18,
          estimatedCTR: 3.2,
          projectedRevenue: 5.76,
        },
        {
          productName: "Skillshare Premium",
          brandName: "Skillshare",
          description: "Learn creative skills from industry professionals",
          productUrl: "https://www.skillshare.com",
          reasoning: "Appeals to viewers interested in skill development",
          relevanceScore: 82,
          estimatedCPM: 16,
          estimatedCTR: 3.0,
          projectedRevenue: 4.8,
        },
      ],
      travel: [
        {
          productName: "Airbnb Plus",
          brandName: "Airbnb",
          description: "Unique stays and experiences around the world",
          productUrl: "https://www.airbnb.com",
          reasoning: "Perfect for travel enthusiasts",
          relevanceScore: 88,
          estimatedCPM: 22,
          estimatedCTR: 4.1,
          projectedRevenue: 9.02,
        },
        {
          productName: "Booking.com Genius",
          brandName: "Booking.com",
          description: "Save 10-20% on accommodations worldwide",
          productUrl: "https://www.booking.com",
          reasoning: "Ideal for destination planning",
          relevanceScore: 85,
          estimatedCPM: 20,
          estimatedCTR: 3.8,
          projectedRevenue: 7.6,
        },
      ],
      food: [
        {
          productName: "HelloFresh Subscription",
          brandName: "HelloFresh",
          description: "Fresh ingredients and recipes delivered weekly",
          productUrl: "https://www.hellofresh.com",
          reasoning: "Perfect for cooking and food enthusiasts",
          relevanceScore: 86,
          estimatedCPM: 17,
          estimatedCTR: 3.4,
          projectedRevenue: 5.78,
        },
        {
          productName: "MasterClass Cooking",
          brandName: "MasterClass",
          description: "Learn from world-renowned chefs",
          productUrl: "https://www.masterclass.com",
          reasoning: "Elevate culinary skills",
          relevanceScore: 83,
          estimatedCPM: 19,
          estimatedCTR: 3.1,
          projectedRevenue: 5.89,
        },
      ],
      fashion: [
        {
          productName: "Stitch Fix",
          brandName: "Stitch Fix",
          description: "Personal styling service delivered to your door",
          productUrl: "https://www.stitchfix.com",
          reasoning: "Personalized fashion recommendations",
          relevanceScore: 84,
          estimatedCPM: 21,
          estimatedCTR: 3.6,
          projectedRevenue: 7.56,
        },
      ],
      fitness: [
        {
          productName: "Peloton Membership",
          brandName: "Peloton",
          description: "Live and on-demand fitness classes",
          productUrl: "https://www.onepeloton.com",
          reasoning: "Matches fitness and wellness content",
          relevanceScore: 87,
          estimatedCPM: 24,
          estimatedCTR: 4.3,
          projectedRevenue: 10.32,
        },
        {
          productName: "Nike Training Club",
          brandName: "Nike",
          description: "Free workouts and training programs",
          productUrl: "https://www.nike.com/ntc-app",
          reasoning: "Perfect for active lifestyle",
          relevanceScore: 85,
          estimatedCPM: 22,
          estimatedCTR: 4.0,
          projectedRevenue: 8.8,
        },
      ],
      technology: [
        {
          productName: "Apple One Bundle",
          brandName: "Apple",
          description: "Music, TV+, Arcade, iCloud+ in one subscription",
          productUrl: "https://www.apple.com/apple-one",
          reasoning: "Tech enthusiast bundle",
          relevanceScore: 86,
          estimatedCPM: 25,
          estimatedCTR: 3.9,
          projectedRevenue: 9.75,
        },
      ],
      productivity: [
        {
          productName: "Notion Premium",
          brandName: "Notion",
          description: "All-in-one workspace for notes, tasks, and wikis",
          productUrl: "https://www.notion.so",
          reasoning: "Perfect for productivity optimization",
          relevanceScore: 88,
          estimatedCPM: 20,
          estimatedCTR: 3.7,
          projectedRevenue: 7.4,
        },
      ],
      product: [
        {
          productName: "Amazon Prime",
          brandName: "Amazon",
          description: "Fast shipping, streaming, and exclusive deals",
          productUrl: "https://www.amazon.com/prime",
          reasoning: "General product interest",
          relevanceScore: 75,
          estimatedCPM: 15,
          estimatedCTR: 2.8,
          projectedRevenue: 4.2,
        },
      ],
      lifestyle: [
        {
          productName: "Calm Premium",
          brandName: "Calm",
          description: "Meditation and sleep stories",
          productUrl: "https://www.calm.com",
          reasoning: "Wellness and lifestyle alignment",
          relevanceScore: 82,
          estimatedCPM: 18,
          estimatedCTR: 3.3,
          projectedRevenue: 5.94,
        },
      ],
      entertainment: [
        {
          productName: "Spotify Premium",
          brandName: "Spotify",
          description: "Ad-free music and podcasts",
          productUrl: "https://www.spotify.com",
          reasoning: "Entertainment content overlap",
          relevanceScore: 80,
          estimatedCPM: 16,
          estimatedCTR: 3.1,
          projectedRevenue: 4.96,
        },
      ],
    };

    return fallbackMap[category] || fallbackMap.product || [];
  }
}

export const createOpenAISearchClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAISearchClient(apiKey);
};
