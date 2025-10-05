"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
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
  engagementScore?: number | null;
  attentionScore?: number | null;
  placementTier?: string | null;
  estimatedCpmMin?: number | null;
  estimatedCpmMax?: number | null;
  categoryTags?: string | null;
}

interface BrandMention {
  timestamp: string;
  timeInSeconds: number;
  description: string;
  type: "brand_mention" | "ad_opportunity";
  recommendations: Recommendation[];
  engagementScore?: number | null;
  attentionScore?: number | null;
  placementTier?: string | null;
  estimatedCpmMin?: number | null;
  estimatedCpmMax?: number | null;
  categoryTags?: string | null;
}

interface DashboardData {
  moments: AdMoment[];
  brandMentions: BrandMention[];
}

export default function DashboardPage() {
  const params = useParams();
  const videoId = params.videoId as string;

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [indexId, setIndexId] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) return;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch dashboard data
        const response = await fetch(`/api/moments/${videoId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const data = await response.json();
        setDashboardData(data);

        // Fetch video info to get indexId
        try {
          const videoResponse = await fetch(`/api/indexes`);
          const indexesData = await videoResponse.json();
          if (indexesData.indexes && indexesData.indexes.length > 0) {
            setIndexId(indexesData.indexes[0]._id);
          }
        } catch (err) {
          console.error("Failed to fetch index ID:", err);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [videoId]);

  // Calculate aggregate metrics based on ad placement spots
  const getAllSpots = () => {
    if (!dashboardData) return [];
    return [...dashboardData.moments, ...dashboardData.brandMentions];
  };

  const allSpots = getAllSpots();

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

  // Helper functions for product metrics (still used for product display)
  const formatCPM = (cpm: number | null | undefined) => {
    if (!cpm) return 0;
    return cpm; // Already in dollars
  };

  const formatCTR = (ctr: number | null | undefined) => {
    if (!ctr) return 0;
    return ctr / 10; // Convert back from stored integer
  };

  const formatRevenue = (revenue: number | null | undefined) => {
    if (!revenue) return 0;
    return revenue / 100; // Convert from cents
  };

  // Calculate spot-based metrics
  const totalSpots = allSpots.length;
  const premiumSpots = allSpots.filter(
    (s) => s.placementTier === "premium"
  ).length;
  const standardSpots = allSpots.filter(
    (s) => s.placementTier === "standard"
  ).length;
  const basicSpots = allSpots.filter((s) => s.placementTier === "basic").length;

  // Calculate average engagement and attention scores
  const avgEngagement =
    allSpots.length > 0
      ? allSpots.reduce((sum, s) => sum + (s.engagementScore || 0), 0) /
        allSpots.length
      : 0;

  const avgAttention =
    allSpots.length > 0
      ? allSpots.reduce((sum, s) => sum + (s.attentionScore || 0), 0) /
        allSpots.length
      : 0;

  // Calculate average CPM based on spot quality
  const avgCpmMin =
    allSpots.length > 0
      ? allSpots.reduce((sum, s) => sum + (s.estimatedCpmMin || 0), 0) /
        allSpots.length /
        100
      : 0;

  const avgCpmMax =
    allSpots.length > 0
      ? allSpots.reduce((sum, s) => sum + (s.estimatedCpmMax || 0), 0) /
        allSpots.length /
        100
      : 0;

  // Calculate total inventory value (sum of all spot CPMs)
  const totalMinValue =
    allSpots.reduce((sum, s) => sum + (s.estimatedCpmMin || 0), 0) / 100;
  const totalMaxValue =
    allSpots.reduce((sum, s) => sum + (s.estimatedCpmMax || 0), 0) / 100;

  // Group recommendations by product
  const uniqueProducts = Array.from(
    new Map(allRecommendations.map((r) => [r.productName, r])).values()
  );

  // Export dashboard data to CSV
  const handleExportDashboard = () => {
    const rows: string[][] = [];

    // Header
    rows.push([
      "Video ID",
      "Total Ad Spots",
      "Premium Spots",
      "Standard Spots",
      "Basic Spots",
      "Avg Engagement",
      "Avg Attention",
      "Avg CPM Min",
      "Avg CPM Max",
      "Total Inventory Value Min",
      "Total Inventory Value Max",
    ]);

    // Summary row
    rows.push([
      videoId,
      totalSpots.toString(),
      premiumSpots.toString(),
      standardSpots.toString(),
      basicSpots.toString(),
      `${avgEngagement.toFixed(0)}%`,
      `${avgAttention.toFixed(0)}%`,
      `$${avgCpmMin.toFixed(2)}`,
      `$${avgCpmMax.toFixed(2)}`,
      `$${totalMinValue.toFixed(2)}`,
      `$${totalMaxValue.toFixed(2)}`,
    ]);

    // Empty row
    rows.push([]);

    // Product recommendations header
    rows.push([
      "Product Name",
      "Brand",
      "Description",
      "Product URL",
      "Relevance Score",
      "Est. CPM",
      "Est. CTR",
      "Projected Revenue",
      "Reasoning",
    ]);

    // Add unique products
    uniqueProducts.forEach((rec) => {
      rows.push([
        rec.productName || "",
        rec.brandName || "",
        `"${(rec.description || "").replace(/"/g, '""')}"`,
        rec.productUrl || "",
        `${rec.relevanceScore || 0}%`,
        rec.estimatedCPM ? `$${formatCPM(rec.estimatedCPM).toFixed(2)}` : "",
        rec.estimatedCTR ? `${formatCTR(rec.estimatedCTR).toFixed(2)}%` : "",
        rec.projectedRevenue
          ? `$${formatRevenue(rec.projectedRevenue).toFixed(2)}`
          : "",
        `"${(rec.reasoning || "").replace(/"/g, '""')}"`,
      ]);
    });

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `momentmatch-dashboard-${videoId}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
          <Link
            href={
              indexId
                ? `/analyze?videoId=${videoId}&indexId=${indexId}`
                : "/analyze"
            }
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Analysis
          </Link>
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
            label="Total Ad Spots"
            value={totalSpots.toString()}
            subtitle={`${premiumSpots} Premium, ${standardSpots} Standard`}
            color="indigo"
          />
          <MetricCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Avg Engagement"
            value={`${avgEngagement.toFixed(0)}%`}
            subtitle={`Attention: ${avgAttention.toFixed(0)}%`}
            color="purple"
          />
          <MetricCard
            icon={<BarChart3 className="w-6 h-6" />}
            label="Avg CPM Range"
            value={`$${avgCpmMin.toFixed(2)}-$${avgCpmMax.toFixed(2)}`}
            subtitle="Per spot"
            color="blue"
          />
          <MetricCard
            icon={<DollarSign className="w-6 h-6" />}
            label="Total Inventory Value"
            value={`$${totalMinValue.toFixed(2)}-$${totalMaxValue.toFixed(2)}`}
            subtitle="Estimated range"
            color="green"
          />
        </div>

        {/* Ad Placement Quality Breakdown */}
        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-700/50 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Ad Placement Quality Analysis
              </h2>
              <p className="text-sm text-indigo-300">
                Spot value based on engagement, attention, and content category
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-black/20 rounded-xl p-6 border-2 border-yellow-500/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <p className="text-sm font-semibold text-yellow-400">
                  PREMIUM SPOTS
                </p>
              </div>
              <p className="text-4xl font-bold text-white mb-1">
                {premiumSpots}
              </p>
              <p className="text-xs text-gray-400">Engagement &gt; 80%</p>
              <p className="text-xs text-green-400 mt-2">+30% CPM boost</p>
            </div>
            <div className="bg-black/20 rounded-xl p-6 border-2 border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <p className="text-sm font-semibold text-blue-400">
                  STANDARD SPOTS
                </p>
              </div>
              <p className="text-4xl font-bold text-white mb-1">
                {standardSpots}
              </p>
              <p className="text-xs text-gray-400">Engagement 60-80%</p>
              <p className="text-xs text-gray-500 mt-2">Base CPM</p>
            </div>
            <div className="bg-black/20 rounded-xl p-6 border-2 border-gray-500/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <p className="text-sm font-semibold text-gray-400">
                  BASIC SPOTS
                </p>
              </div>
              <p className="text-4xl font-bold text-white mb-1">{basicSpots}</p>
              <p className="text-xs text-gray-400">Engagement &lt; 60%</p>
              <p className="text-xs text-orange-400 mt-2">-30% CPM</p>
            </div>
            <div className="bg-black/20 rounded-xl p-6">
              <p className="text-sm text-gray-400 mb-2">Avg Spot Value</p>
              <p className="text-3xl font-bold text-green-400 mb-1">
                ${((avgCpmMin + avgCpmMax) / 2).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">CPM per placement</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
            <p className="text-sm text-indigo-300">
              📊 <strong>How This Works:</strong> Each ad spot is analyzed for
              engagement level, viewer attention, emotional intensity, and
              content category. CPM ranges are based on industry standards for
              detected categories (Finance $20-40, Tech $10-22, Sports $10-18,
              etc.) with quality multipliers applied.
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
            <button
              onClick={handleExportDashboard}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              <Download className="w-4 h-4" />
              Export Dashboard CSV
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
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
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
      {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
    </div>
  );
}
