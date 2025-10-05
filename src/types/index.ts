export interface AdRecommendation {
  id: string;
  productName: string;
  brandName: string;
  description: string;
  productUrl: string;
  imageUrl: string;
  reasoning: string;
  relevanceScore: number;
  selected: boolean;
  estimatedCPM?: number | null;
  estimatedCTR?: number | null;
  projectedRevenue?: number | null;
}

export interface AdMoment {
  id: string;
  startTime: number;
  endTime: number;
  context: string;
  emotionalTone: string;
  category: string;
  confidence: number;
  clipUrl: string;
  thumbnailUrl: string;
  recommendations: AdRecommendation[];
  engagementScore?: number | null;
  attentionScore?: number | null;
  placementTier?: string | null;
  estimatedCpmMin?: number | null;
  estimatedCpmMax?: number | null;
  categoryTags?: string | null;
}

export interface Video {
  id: string;
  filename: string;
  uploadedAt: Date;
  status: "processing" | "completed" | "failed";
  videoUrl?: string;
  duration?: number;
}
