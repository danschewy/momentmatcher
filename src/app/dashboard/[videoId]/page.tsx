"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Package,
  Target,
  Download,
  BarChart3,
} from "lucide-react";

interface Recommendation {
  productName: string;
  brandName: string;
  description: string;
  productUrl: string;
  imageUrl?: string;
  reasoning: string;
  relevanceScore: number;
  estimatedCPM?: number | null;
  estimatedCTR?: number | null;
  projectedRevenue?: number | null;
}

interface AdMoment {
  id: string;
  startTime: number;
  endTime: number;
  context: string;
  emotionalTone: string;
  category: string;
  confidence: number;
  recommendations: Recommendation[];
}

interface BrandMention {
  timestamp: string;
  timeInSeconds: number;
  description: string;
  type: "brand_mention" | "ad_opportunity";
  recommendations: Recommendation[];
}

interface DashboardData {
  moments: AdMoment[];
  brandMentions: BrandMention[];
}

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.videoId as string;

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) return;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/moments/${videoId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [videoId]);

  // Calculate aggregate metrics
  const getAllRecommendations = (): Recommendation[] => {
    if (!dashboardData) return [];

    const momentRecs = dashboardData.moments.flatMap(
      (m) => m.recommendations || []
    );
    const mentionRecs = dashboardData.brandMentions.flatMap(
      (m) => m.recommendations || []
    );

    return [...momentRecs, ...mentionRecs];
  };

  const allRecommendations = getAllRecommendations();

  // Convert stored integers back to display values
  const formatCPM = (cpm: number | null | undefined) => {
    if (!cpm) return 0;
    return cpm; // Already in dollars
  };

  const formatCTR = (ctr: number | null | undefined) => {
    if (!ctr) return 0;
    return ctr / 10; // Convert back from stored integer (25 -> 2.5%)
  };

  const formatRevenue = (revenue: number | null | undefined) => {
    if (!revenue) return 0;
    return revenue / 100; // Convert from cents to dollars
  };

  const totalMoments =
    (dashboardData?.moments.length || 0) +
    (dashboardData?.brandMentions.length || 0);
  const totalRecommendations = allRecommendations.length;

  const avgCPM =
    allRecommendations.length > 0
      ? allRecommendations.reduce(
          (sum, r) => sum + formatCPM(r.estimatedCPM),
          0
        ) / allRecommendations.length
      : 0;

  const avgCTR =
    allRecommendations.length > 0
      ? allRecommendations.reduce(
          (sum, r) => sum + formatCTR(r.estimatedCTR),
          0
        ) / allRecommendations.length
      : 0;

  const totalProjectedRevenue = allRecommendations.reduce(
    (sum, r) => sum + formatRevenue(r.projectedRevenue),
    0
  );

  // Group recommendations by product
  const uniqueProducts = Array.from(
    new Map(allRecommendations.map((r) => [r.productName, r])).values()
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center text-red-400">
          <p className="text-xl mb-4">Failed to load dashboard data</p>
          <p className="text-sm text-gray-500">{error || "Unknown error"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Analysis
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Publisher Ad Inventory Dashboard
          </h1>
          <p className="text-gray-400">
            Comprehensive overview of ad placement opportunities and revenue
            projections
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<Target className="w-6 h-6" />}
            label="Ad Moments"
            value={totalMoments.toString()}
            color="indigo"
          />
          <MetricCard
            icon={<Package className="w-6 h-6" />}
            label="Products"
            value={totalRecommendations.toString()}
            color="purple"
          />
          <MetricCard
            icon={<BarChart3 className="w-6 h-6" />}
            label="Avg CPM"
            value={`$${avgCPM.toFixed(2)}`}
            color="blue"
          />
          <MetricCard
            icon={<DollarSign className="w-6 h-6" />}
            label="Projected Revenue"
            value={`$${totalProjectedRevenue.toFixed(2)}`}
            color="green"
          />
        </div>

        {/* Revenue Impact Projection */}
        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-700/50 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Revenue Impact Projection
              </h2>
              <p className="text-sm text-green-300">
                Based on AI analysis and industry benchmarks
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-black/20 rounded-xl p-6">
              <p className="text-sm text-gray-400 mb-2">Average CPM</p>
              <p className="text-3xl font-bold text-white mb-1">
                ${avgCPM.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">Cost per 1000 impressions</p>
            </div>
            <div className="bg-black/20 rounded-xl p-6">
              <p className="text-sm text-gray-400 mb-2">Average CTR</p>
              <p className="text-3xl font-bold text-white mb-1">
                {avgCTR.toFixed(2)}%
              </p>
              <p className="text-xs text-gray-500">Click-through rate</p>
            </div>
            <div className="bg-black/20 rounded-xl p-6">
              <p className="text-sm text-gray-400 mb-2">Total Potential</p>
              <p className="text-3xl font-bold text-green-400 mb-1">
                ${totalProjectedRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">Per video placement</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-300">
              💡 <strong>Industry Insight:</strong> These projections are based
              on contextual relevance, emotional engagement, and historical ad
              performance data. Actual revenue may vary based on audience
              demographics, video reach, and advertiser demand.
            </p>
          </div>
        </div>

        {/* All Recommended Products */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Recommended Products & Brands
              </h2>
              <p className="text-sm text-gray-400">
                {uniqueProducts.length} unique products optimized for your
                content
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          <div className="space-y-4">
            {uniqueProducts.map((rec, idx) => (
              <div
                key={idx}
                className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-indigo-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {rec.productName}
                      </h3>
                      <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-medium">
                        {rec.relevanceScore}% Match
                      </span>
                    </div>
                    <p className="text-sm text-indigo-400 mb-3">
                      {rec.brandName}
                    </p>
                    <p className="text-gray-400 mb-4">{rec.description}</p>
                    <p className="text-sm text-gray-500 italic mb-4">
                      💡 {rec.reasoning}
                    </p>

                    {/* Revenue Metrics */}
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">CPM:</span>{" "}
                        <span className="text-green-400 font-semibold">
                          ${formatCPM(rec.estimatedCPM).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">CTR:</span>{" "}
                        <span className="text-blue-400 font-semibold">
                          {formatCTR(rec.estimatedCTR).toFixed(2)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Est. Revenue:</span>{" "}
                        <span className="text-purple-400 font-semibold">
                          ${formatRevenue(rec.projectedRevenue).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={rec.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition ml-4 flex-shrink-0"
                  >
                    View Product →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "indigo" | "purple" | "blue" | "green";
}) {
  const colorClasses = {
    indigo:
      "from-indigo-900/20 to-indigo-800/20 border-indigo-700/50 text-indigo-400",
    purple:
      "from-purple-900/20 to-purple-800/20 border-purple-700/50 text-purple-400",
    blue: "from-blue-900/20 to-blue-800/20 border-blue-700/50 text-blue-400",
    green:
      "from-green-900/20 to-green-800/20 border-green-700/50 text-green-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`${colorClasses[color].split(" ")[4]}`}>{icon}</div>
      </div>
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
