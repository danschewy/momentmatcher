"use client";

import { AdMoment } from "@/types";
import { Target } from "lucide-react";

interface VideoTimelineProps {
  moments: AdMoment[];
  currentTime: number;
  onMomentClick: (moment: AdMoment) => void;
  selectedMoment: AdMoment | null;
}

const emotionColors: Record<string, string> = {
  excited: "bg-yellow-500",
  positive: "bg-green-500",
  neutral: "bg-blue-500",
  negative: "bg-red-500",
  motivated: "bg-purple-500",
};

export default function VideoTimeline({
  moments,
  currentTime,
  onMomentClick,
  selectedMoment,
}: VideoTimelineProps) {
  if (moments.length === 0) return null;

  const maxTime = Math.max(...moments.map((m) => m.endTime), 180); // Default to 3 min minimum

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-indigo-400" />
        <h3 className="text-xl font-bold text-white">Ad Moment Timeline</h3>
        <span className="ml-auto text-sm text-gray-400">
          {moments.length} opportunities detected
        </span>
      </div>

      <div className="relative">
        {/* Timeline bar */}
        <div className="relative h-16 bg-gray-900 rounded-lg overflow-hidden">
          {/* Current time indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white z-20"
            style={{ left: `${(currentTime / maxTime) * 100}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full" />
          </div>

          {/* Moment markers */}
          {moments.map((moment) => {
            const leftPercent = (moment.startTime / maxTime) * 100;
            const widthPercent =
              ((moment.endTime - moment.startTime) / maxTime) * 100;
            const isSelected = selectedMoment?.id === moment.id;
            const colorClass =
              emotionColors[moment.emotionalTone] || "bg-indigo-500";

            return (
              <button
                key={moment.id}
                onClick={() => onMomentClick(moment)}
                className={`
                  absolute top-0 bottom-0 ${colorClass} opacity-80 hover:opacity-100
                  transition-all cursor-pointer group
                  ${isSelected ? "ring-2 ring-white" : ""}
                `}
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                }}
                title={moment.context}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {formatTime(moment.startTime)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Time labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{formatTime(0)}</span>
          <span>{formatTime(maxTime / 4)}</span>
          <span>{formatTime(maxTime / 2)}</span>
          <span>{formatTime((3 * maxTime) / 4)}</span>
          <span>{formatTime(maxTime)}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6">
        {Object.entries(emotionColors).map(([emotion, colorClass]) => (
          <div key={emotion} className="flex items-center gap-2">
            <div className={`w-3 h-3 ${colorClass} rounded-full`} />
            <span className="text-sm text-gray-400 capitalize">{emotion}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
