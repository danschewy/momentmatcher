"use client";

import { Target, Sparkles, TrendingUp, Video } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">MomentMatch AI</h1>
          </div>
          <nav className="flex gap-6">
            <a
              href="#features"
              className="text-gray-300 hover:text-white transition"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-300 hover:text-white transition"
            >
              How It Works
            </a>
            <Link
              href="/analyze"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Start Analyzing
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Ad Intelligence</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Transform Videos Into
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Revenue Machines
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            MomentMatch AI analyzes every frame, word, and emotion to identify
            the perfect moments for ad placement. Maximize engagement, ROI, and
            monetization with intelligent, context-aware advertising.
          </p>
        </div>

        {/* CTA Section */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-2 border-gray-700 rounded-3xl p-12 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/50">
                <Video className="w-14 h-14 text-white" />
              </div>

              <div>
                <h3 className="text-3xl font-bold text-white mb-3">
                  Ready to Optimize Your Ad Inventory?
                </h3>
                <p className="text-lg text-gray-400">
                  Analyze your videos and discover premium ad placement
                  opportunities
                </p>
              </div>

              <Link href="/analyze" className="w-full max-w-md">
                <button className="w-full px-12 py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xl font-bold rounded-2xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.02] shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50">
                  Enter Now →
                </button>
              </Link>

              <p className="text-sm text-gray-500">
                Select from your library or enter a video URL to begin
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <h3 className="text-4xl font-bold text-white text-center mb-16">
          Why Content Creators & Advertisers Love Us
        </h3>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Video className="w-8 h-8" />}
            title="Deep Video Analysis"
            description="Our AI understands every frame, word, and emotion in your content using Twelve Labs' advanced video intelligence."
          />

          <FeatureCard
            icon={<Target className="w-8 h-8" />}
            title="Perfect Moment Detection"
            description="Identify optimal ad placement moments based on context, emotion, and viewer engagement potential."
          />

          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Smart Ad Matching"
            description="OpenAI-powered recommendations find the perfect products and brands for each moment, maximizing relevance and ROI."
          />
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20">
        <h3 className="text-4xl font-bold text-white text-center mb-16">
          Three Steps to Monetization
        </h3>

        <div className="grid md:grid-cols-3 gap-12">
          <StepCard
            number="01"
            title="Upload"
            description="Upload your video and let our AI analyze every moment"
          />

          <StepCard
            number="02"
            title="Analyze"
            description="Review AI-identified ad moments with context and recommendations"
          />

          <StepCard
            number="03"
            title="Export"
            description="Generate reports with timestamps and ad recommendations"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center text-gray-500">
          <p>Built with Next.js, NeonDB, Twelve Labs, and OpenAI</p>
          <p className="mt-2 text-sm">
            © 2025 MomentMatch AI. Hackathon Project.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 bg-gray-800/50 border border-gray-700 rounded-2xl hover:border-indigo-500/50 transition-all">
      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-xl flex items-center justify-center text-indigo-400 mb-6">
        {icon}
      </div>
      <h4 className="text-xl font-bold text-white mb-3">{title}</h4>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full text-3xl font-bold text-white mb-6">
        {number}
      </div>
      <h4 className="text-2xl font-bold text-white mb-3">{title}</h4>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
