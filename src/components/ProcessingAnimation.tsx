"use client";

import { Loader2, Video, Brain, Target, Sparkles } from "lucide-react";

export default function ProcessingAnimation() {
  const steps = [
    { icon: Video, text: "Analyzing video frames", delay: "0s" },
    { icon: Brain, text: "Understanding context & emotion", delay: "0.2s" },
    { icon: Target, text: "Detecting ad moments", delay: "0.4s" },
    { icon: Sparkles, text: "Generating recommendations", delay: "0.6s" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
      </div>

      <div className="space-y-3">
        {steps.map((Step, index) => (
          <div
            key={index}
            className="flex items-center gap-3 opacity-0 animate-fadeIn"
            style={{
              animationDelay: Step.delay,
              animationFillMode: "forwards",
            }}
          >
            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <Step.icon className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-gray-300">{Step.text}</p>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
