"use client";

import { AdMoment } from "@/types";
import { Clock, Target, TrendingUp, Sparkles, Play } from "lucide-react";
import HLSVideoPlayer from "./HLSVideoPlayer";

interface MomentCardProps {
  moment: AdMoment;
  isSelected: boolean;
  onClick: () => void;
}

const emotionEmojis: Record<string, string> = {
  excited: "🎉",
  positive: "😊",
  neutral: "😐",
  negative: "😔",
  motivated: "💪",
};

const categoryIcons: Record<string, React.ReactNode> = {
  educational: <Sparkles className="w-4 h-4" />,
  technology: <Target className="w-4 h-4" />,
  lifestyle: <TrendingUp className="w-4 h-4" />,
  productivity: <Clock className="w-4 h-4" />,
};

export default function MomentCard({
  moment,
  isSelected,
  onClick,
}: MomentCardProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`
        relative rounded-xl border-2 transition-all overflow-hidden
        ${
          isSelected
            ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/25"
            : "border-gray-700 bg-gray-800/50 hover:border-indigo-500/50"
        }
      `}
    >
      {/* Video Clip/Thumbnail */}
      {moment.clipUrl && (
        <div className="relative w-full h-40 bg-gray-900 overflow-hidden group">
          {isSelected ? (
            <HLSVideoPlayer
              src={moment.clipUrl}
              className="w-full h-full object-cover"
              controls
            />
          ) : (
            <div
              onClick={onClick}
              className="relative w-full h-full cursor-pointer"
            >
              {moment.thumbnailUrl ? (
                <img
                  src={moment.thumbnailUrl}
                  alt="Moment thumbnail"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-gray-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <div className="w-16 h-16 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {moment.endTime - moment.startTime}s
              </div>
            </div>
          )}
        </div>
      )}

      <button onClick={onClick} className="w-full p-6 text-left">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              {categoryIcons[moment.category] || (
                <Target className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {emotionEmojis[moment.emotionalTone] || "🎯"}
                </span>
                <span className="text-sm font-medium text-indigo-400 capitalize">
                  {moment.emotionalTone}
                </span>
              </div>
              <p className="text-xs text-gray-500 capitalize">
                {moment.category}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-medium text-white">
              {formatTime(moment.startTime)}
            </div>
            <div className="text-xs text-gray-500">
              {moment.endTime - moment.startTime}s
            </div>
          </div>
        </div>

        {/* Context */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {moment.context}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
              {moment.confidence}% Confidence
            </span>
          </div>

          <div className="text-xs text-gray-400">
            {moment.recommendations.length} ad
            {moment.recommendations.length !== 1 ? "s" : ""}
          </div>
        </div>

        {isSelected && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
        )}
      </button>
    </div>
  );
}
