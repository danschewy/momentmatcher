"use client";

import { Info } from "lucide-react";
import { useState } from "react";

interface InfoTooltipProps {
  title: string;
  description: string;
  calculation?: string;
  justification?: string;
  size?: "sm" | "md";
}

export default function InfoTooltip({
  title,
  description,
  calculation,
  justification,
  size = "sm",
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="inline-flex items-center justify-center text-gray-400 hover:text-indigo-400 transition-colors ml-1.5"
        aria-label="More information"
      >
        <Info className={iconSize} />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-80 p-4 bg-gray-900 border border-indigo-500/50 rounded-lg shadow-xl"
          style={{
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: "8px",
          }}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {/* Arrow pointing down */}
          <div
            className="absolute w-3 h-3 bg-gray-900 border-r border-b border-indigo-500/50 transform rotate-45"
            style={{
              top: "100%",
              left: "50%",
              marginTop: "-6px",
              marginLeft: "-6px",
            }}
          />

          <div className="relative">
            <h4 className="text-sm font-bold text-indigo-400 mb-2">
              ℹ️ {title}
            </h4>
            
            <div className="space-y-2 text-xs text-gray-300">
              <div>
                <p className="font-semibold text-white mb-1">What it means:</p>
                <p className="leading-relaxed">{description}</p>
              </div>

              {calculation && (
                <div>
                  <p className="font-semibold text-white mb-1">How it&apos;s calculated:</p>
                  <p className="leading-relaxed text-purple-300">{calculation}</p>
                </div>
              )}

              {justification && (
                <div>
                  <p className="font-semibold text-white mb-1">Why it matters:</p>
                  <p className="leading-relaxed text-green-300">{justification}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
