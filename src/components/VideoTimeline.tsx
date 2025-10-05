"use client";

import { AdMoment } from "@/types";
import { Target, Zap, Star, Circle } from "lucide-react";

interface VideoTimelineProps {
  moments: AdMoment[];
  currentTime: number;
  onMomentClick: (moment: AdMoment) => void;
  selectedMoment: AdMoment | null;
}

const tierConfig: Record<
  string,
  {
    color: string;
    gradient: string;
    glow: string;
    height: string;
    icon: React.ReactNode;
    label: string;
  }
> = {
  premium: {
    color: "bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500",
    gradient: "from-yellow-500/20 to-amber-500/20",
    glow: "shadow-lg shadow-yellow-500/50",
    height: "h-20",
    icon: <Star className="w-3 h-3" />,
    label: "Premium",
  },
  standard: {
    color: "bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500",
    gradient: "from-blue-500/20 to-indigo-500/20",
    glow: "shadow-md shadow-blue-500/30",
    height: "h-16",
    icon: <Zap className="w-3 h-3" />,
    label: "Standard",
  },
  basic: {
    color: "bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600",
    gradient: "from-gray-500/20 to-gray-600/20",
    glow: "",
    height: "h-12",
    icon: <Circle className="w-3 h-3" />,
    label: "Basic",
  },
};

export default function VideoTimeline({
  moments,
  currentTime,
  onMomentClick,
  selectedMoment,
}: VideoTimelineProps) {
  if (moments.length === 0) return null;

  // Debug logging
  console.log("=== VideoTimeline Debug ===");
  console.log("Total moments:", moments.length);
  console.log(
    "Premium spots:",
    moments.filter((m) => m.placementTier === "premium").length
  );
  console.log(
    "Standard spots:",
    moments.filter((m) => m.placementTier === "standard").length
  );
  console.log(
    "Basic spots:",
    moments.filter((m) => m.placementTier === "basic").length
  );
  console.log(
    "All placement tiers:",
    moments.map((m) => m.placementTier)
  );
  console.log("Sample moment:", moments[0]);

  const maxTime = Math.max(...moments.map((m) => m.endTime), 180);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCpm = (
    min: number | null | undefined,
    max: number | null | undefined
  ) => {
    if (!min || !max) return "";
    return `$${(min / 100).toFixed(0)}-${(max / 100).toFixed(0)}`;
  };

  // Count tiers
  const premiumCount = moments.filter(
    (m) => m.placementTier === "premium"
  ).length;
  const standardCount = moments.filter(
    (m) => m.placementTier === "standard"
  ).length;
  const basicCount = moments.filter((m) => m.placementTier === "basic").length;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xl font-bold text-white">
            Ad Placement Quality Timeline
          </h3>
        </div>
        <span className="text-sm text-gray-400">
          {moments.length} spots identified
        </span>
      </div>

      <div className="relative">
        {/* Timeline container with extra height for premium spots */}
        <div className="relative h-28 bg-gray-900 rounded-lg overflow-visible px-2 py-2">
          {/* Current time indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white z-30"
            style={{ left: `${(currentTime / maxTime) * 100}%` }}
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg" />
          </div>

          {/* Moment markers - positioned from bottom */}
          {moments.map((moment) => {
            const leftPercent = (moment.startTime / maxTime) * 100;
            const widthPercent =
              ((moment.endTime - moment.startTime) / maxTime) * 100;
            const isSelected = selectedMoment?.id === moment.id;
            const tier = (moment.placementTier ||
              "standard") as keyof typeof tierConfig;
            const config = tierConfig[tier];

            return (
              <button
                key={moment.id}
                onClick={() => onMomentClick(moment)}
                className={`
                  absolute ${config.color} ${config.glow}
                  bottom-0 rounded-t-lg
                  transition-all duration-300 cursor-pointer group
                  hover:brightness-125 hover:scale-y-110
                  ${
                    isSelected
                      ? "ring-4 ring-white scale-y-110 brightness-125"
                      : ""
                  }
                `}
                style={{
                  left: `${leftPercent}%`,
                  width: `${Math.max(widthPercent, 1.5)}%`,
                  height:
                    tier === "premium"
                      ? "96px"
                      : tier === "standard"
                      ? "64px"
                      : "44px",
                }}
                title={`${config.label} Spot: ${moment.context.substring(
                  0,
                  100
                )}`}
              >
                {/* Tier badge - only show for premium */}
                {tier === "premium" && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-yellow-500 text-yellow-950 px-2 py-0.5 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Star className="w-3 h-3 fill-yellow-950" />
                    PREMIUM
                  </div>
                )}

                {/* Hover tooltip */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-40">
                  <div
                    className={`bg-gradient-to-br ${config.gradient} backdrop-blur-sm bg-gray-900/90 text-white text-xs px-3 py-2 rounded-lg border border-gray-700 shadow-xl`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {config.icon}
                      <span className="font-bold">{config.label} Spot</span>
                    </div>
                    <div className="text-gray-300">
                      {formatTime(moment.startTime)} -{" "}
                      {formatTime(moment.endTime)}
                    </div>
                    {moment.engagementScore && (
                      <div className="text-gray-400 text-[10px] mt-1">
                        Engagement: {moment.engagementScore}% • CPM:{" "}
                        {formatCpm(
                          moment.estimatedCpmMin,
                          moment.estimatedCpmMax
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual effects for premium spots */}
                {tier === "premium" && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    <div className="absolute inset-0 animate-pulse opacity-30 bg-yellow-300" />
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Time labels */}
        <div className="flex justify-between mt-3 text-xs text-gray-500">
          <span>{formatTime(0)}</span>
          <span>{formatTime(maxTime / 4)}</span>
          <span>{formatTime(maxTime / 2)}</span>
          <span>{formatTime((3 * maxTime) / 4)}</span>
          <span>{formatTime(maxTime)}</span>
        </div>
      </div>

      {/* Legend with counts */}
      <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg border border-yellow-500/30">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold text-yellow-400">
              Premium
            </span>
            <span className="text-xs text-gray-400">({premiumCount})</span>
          </div>
          <span className="text-xs text-gray-500">
            80%+ engagement • +30% CPM
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg border border-blue-500/30">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400">
              Standard
            </span>
            <span className="text-xs text-gray-400">({standardCount})</span>
          </div>
          <span className="text-xs text-gray-500">
            60-80% engagement • Base CPM
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-500/10 to-gray-600/10 rounded-lg border border-gray-500/30">
            <Circle className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-400">Basic</span>
            <span className="text-xs text-gray-400">({basicCount})</span>
          </div>
          <span className="text-xs text-gray-500">
            &lt;60% engagement • -30% CPM
          </span>
        </div>
      </div>
    </div>
  );
}
