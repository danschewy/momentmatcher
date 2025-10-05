/**
 * Ad Placement Spot Value Calculator
 *
 * Calculates the value of ad placement spots based on:
 * 1. Content engagement/attention scores
 * 2. Content category (derived from context analysis)
 * 3. Industry standard CPM rates by category
 */

// Industry-standard CPM ranges by content category (in dollars)
const CPM_RANGES_BY_CATEGORY: Record<string, { min: number; max: number }> = {
  finance: { min: 20, max: 40 },
  insurance: { min: 18, max: 35 },
  health: { min: 12, max: 25 },
  fitness: { min: 10, max: 20 },
  technology: { min: 10, max: 22 },
  gaming: { min: 8, max: 15 },
  sports: { min: 10, max: 18 },
  lifestyle: { min: 8, max: 15 },
  fashion: { min: 9, max: 16 },
  beauty: { min: 10, max: 18 },
  food: { min: 7, max: 14 },
  travel: { min: 9, max: 17 },
  automotive: { min: 12, max: 24 },
  real_estate: { min: 15, max: 30 },
  education: { min: 8, max: 16 },
  business: { min: 12, max: 22 },
  entertainment: { min: 6, max: 12 },
  news: { min: 5, max: 10 },
  default: { min: 7, max: 14 },
};

export interface SpotQualityMetrics {
  engagementScore: number; // 0-100
  attentionScore: number; // 0-100
  placementTier: "premium" | "standard" | "basic";
  estimatedCpmMin: number; // in cents
  estimatedCpmMax: number; // in cents
  categoryTags: string[]; // detected categories
  overallScore: number; // 0-100
}

/**
 * Detect content categories from context description
 */
export function detectCategories(context: string): string[] {
  const contextLower = context.toLowerCase();
  const categories: string[] = [];

  const categoryKeywords: Record<string, string[]> = {
    finance: [
      "money",
      "investment",
      "stock",
      "trading",
      "crypto",
      "banking",
      "financial",
    ],
    health: ["health", "medical", "wellness", "diet", "nutrition", "doctor"],
    fitness: ["workout", "exercise", "gym", "training", "athlete", "running"],
    technology: [
      "tech",
      "software",
      "app",
      "digital",
      "ai",
      "computer",
      "coding",
    ],
    gaming: ["game", "gaming", "esports", "video game", "console", "stream"],
    sports: [
      "sports",
      "football",
      "basketball",
      "soccer",
      "championship",
      "team",
    ],
    lifestyle: ["lifestyle", "daily", "routine", "tips", "advice"],
    fashion: ["fashion", "style", "clothing", "outfit", "trend"],
    beauty: ["makeup", "beauty", "skincare", "cosmetics"],
    food: ["food", "cooking", "recipe", "restaurant", "meal"],
    travel: ["travel", "vacation", "trip", "destination", "tourist"],
    automotive: ["car", "vehicle", "auto", "driving", "motorcycle"],
    real_estate: ["real estate", "property", "house", "home buying"],
    education: ["education", "learning", "tutorial", "course", "teach"],
    business: ["business", "entrepreneur", "startup", "marketing", "sales"],
    entertainment: ["entertainment", "movie", "music", "show", "concert"],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => contextLower.includes(keyword))) {
      categories.push(category);
    }
  }

  return categories.length > 0 ? categories : ["default"];
}

/**
 * Calculate CPM range based on categories and quality scores
 */
export function calculateCpmRange(
  categories: string[],
  engagementScore: number,
  attentionScore: number
): { min: number; max: number } {
  // Get the highest CPM range from detected categories
  let baseCpm = CPM_RANGES_BY_CATEGORY.default;

  for (const category of categories) {
    const categoryCpm = CPM_RANGES_BY_CATEGORY[category];
    if (categoryCpm && categoryCpm.max > baseCpm.max) {
      baseCpm = categoryCpm;
    }
  }

  // Calculate quality multiplier based on engagement and attention
  const qualityScore = (engagementScore + attentionScore) / 2;
  let multiplier = 1.0;

  if (qualityScore >= 80) {
    multiplier = 1.3; // Premium spots get 30% boost
  } else if (qualityScore >= 60) {
    multiplier = 1.0; // Standard spots
  } else {
    multiplier = 0.7; // Basic spots get 30% reduction
  }

  return {
    min: Math.round(baseCpm.min * multiplier * 100), // Convert to cents
    max: Math.round(baseCpm.max * multiplier * 100),
  };
}

/**
 * Determine placement tier based on engagement and attention scores
 */
export function determinePlacementTier(
  engagementScore: number,
  attentionScore: number
): "premium" | "standard" | "basic" {
  const avgScore = (engagementScore + attentionScore) / 2;

  if (avgScore >= 80) return "premium";
  if (avgScore >= 60) return "standard";
  return "basic";
}

/**
 * Calculate overall spot quality score
 */
export function calculateOverallScore(
  engagementScore: number,
  attentionScore: number,
  confidence: number
): number {
  // Weighted average: engagement (40%), attention (40%), confidence (20%)
  return Math.round(
    engagementScore * 0.4 + attentionScore * 0.4 + confidence * 0.2
  );
}

/**
 * Main function to calculate all spot quality metrics
 */
export function calculateSpotQuality(
  context: string,
  emotionalTone: string,
  confidence: number
): SpotQualityMetrics {
  // Detect categories from context
  const categoryTags = detectCategories(context);

  // Calculate engagement score based on emotional intensity and confidence
  // High emotion = high engagement
  const emotionIntensity = calculateEmotionIntensity(emotionalTone);
  const engagementScore = Math.min(
    100,
    Math.round(emotionIntensity * 0.6 + confidence * 0.4)
  );

  // Calculate attention score based on confidence and emotion
  // Confident, clear moments = high attention
  const attentionScore = Math.min(
    100,
    Math.round(confidence * 0.7 + emotionIntensity * 0.3)
  );

  // Determine placement tier
  const placementTier = determinePlacementTier(engagementScore, attentionScore);

  // Calculate CPM range
  const { min: estimatedCpmMin, max: estimatedCpmMax } = calculateCpmRange(
    categoryTags,
    engagementScore,
    attentionScore
  );

  // Calculate overall score
  const overallScore = calculateOverallScore(
    engagementScore,
    attentionScore,
    confidence
  );

  return {
    engagementScore,
    attentionScore,
    placementTier,
    estimatedCpmMin,
    estimatedCpmMax,
    categoryTags,
    overallScore,
  };
}

/**
 * Calculate emotion intensity score from emotional tone
 */
function calculateEmotionIntensity(emotionalTone: string): number {
  const toneLower = emotionalTone.toLowerCase();

  const highIntensity = [
    "excited",
    "thrilled",
    "ecstatic",
    "energetic",
    "passionate",
    "intense",
  ];
  const mediumIntensity = [
    "happy",
    "positive",
    "optimistic",
    "motivated",
    "engaged",
  ];
  const lowIntensity = ["neutral", "calm", "relaxed", "casual"];

  if (highIntensity.some((emotion) => toneLower.includes(emotion))) {
    return 90;
  }
  if (mediumIntensity.some((emotion) => toneLower.includes(emotion))) {
    return 70;
  }
  if (lowIntensity.some((emotion) => toneLower.includes(emotion))) {
    return 50;
  }

  return 60; // default
}

/**
 * Format CPM range for display
 */
export function formatCpmRange(cpmMin: number, cpmMax: number): string {
  return `$${(cpmMin / 100).toFixed(2)}-$${(cpmMax / 100).toFixed(2)}`;
}

/**
 * Calculate total inventory value for a video
 */
export function calculateInventoryValue(spots: SpotQualityMetrics[]): {
  totalSpots: number;
  premiumSpots: number;
  standardSpots: number;
  basicSpots: number;
  estimatedMinValue: number;
  estimatedMaxValue: number;
  averageCpm: number;
} {
  const totalSpots = spots.length;
  const premiumSpots = spots.filter(
    (s) => s.placementTier === "premium"
  ).length;
  const standardSpots = spots.filter(
    (s) => s.placementTier === "standard"
  ).length;
  const basicSpots = spots.filter((s) => s.placementTier === "basic").length;

  const estimatedMinValue = spots.reduce(
    (sum, s) => sum + s.estimatedCpmMin,
    0
  );
  const estimatedMaxValue = spots.reduce(
    (sum, s) => sum + s.estimatedCpmMax,
    0
  );

  const averageCpm =
    totalSpots > 0
      ? (estimatedMinValue + estimatedMaxValue) / 2 / totalSpots
      : 0;

  return {
    totalSpots,
    premiumSpots,
    standardSpots,
    basicSpots,
    estimatedMinValue,
    estimatedMaxValue,
    averageCpm,
  };
}
