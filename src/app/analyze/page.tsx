"use client";

import { useState, useRef } from "react";
import { Upload, Target, TrendingUp, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import VideoTimeline from "@/components/VideoTimeline";
import MomentCard from "@/components/MomentCard";
import ProcessingAnimation from "@/components/ProcessingAnimation";
import VideoLibrary from "@/components/VideoLibrary";
import { AdMoment } from "@/types";

export default function AnalyzePage() {
  const [mode, setMode] = useState<"select" | "upload">("select"); // New state for mode
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedMoment, setSelectedMoment] = useState<AdMoment | null>(null);
  const [adMoments, setAdMoments] = useState<AdMoment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setVideoUrl(url);
    setMode("upload");
  };

  const handleVideoLibrarySelect = (
    _indexId: string,
    _videoId: string,
    _filename: string
  ) => {
    setMode("select");
    // Trigger analysis for the selected video
    setIsProcessing(true);

    // Simulate processing with demo data
    setTimeout(() => {
      const demoMoments: AdMoment[] = generateDemoMoments();
      setAdMoments(demoMoments);
      setIsProcessing(false);
      setIsAnalyzed(true);
      setSelectedMoment(demoMoments[0]);
    }, 3000);
  };

  const generateDemoMoments = (): AdMoment[] => {
    return [
      {
        id: "1",
        startTime: 15,
        endTime: 22,
        context:
          "Vlogger discusses returning to school and preparing for new semester",
        emotionalTone: "excited",
        category: "educational",
        confidence: 92,
        clipUrl: videoUrl,
        thumbnailUrl: "",
        recommendations: [
          {
            id: "r1",
            productName: "Coursera Plus",
            brandName: "Coursera",
            description:
              "Unlimited access to 7,000+ courses from top universities",
            productUrl: "https://coursera.org",
            imageUrl: "",
            reasoning:
              "Perfect match for educational content and back-to-school moment",
            relevanceScore: 95,
            selected: true,
          },
          {
            id: "r2",
            productName: "Notion Student Plan",
            brandName: "Notion",
            description:
              "Free for students - All-in-one workspace for notes and projects",
            productUrl: "https://notion.so",
            imageUrl: "",
            reasoning: "Students need organizational tools for new semester",
            relevanceScore: 88,
            selected: false,
          },
        ],
      },
      {
        id: "2",
        startTime: 45,
        endTime: 53,
        context:
          "Creator shares excitement about new camera equipment and gear setup",
        emotionalTone: "positive",
        category: "technology",
        confidence: 88,
        clipUrl: videoUrl,
        thumbnailUrl: "",
        recommendations: [
          {
            id: "r3",
            productName: "Sony A7 IV",
            brandName: "Sony",
            description: "Professional mirrorless camera for creators",
            productUrl: "https://sony.com",
            imageUrl: "",
            reasoning: "Tech-savvy audience interested in camera equipment",
            relevanceScore: 91,
            selected: true,
          },
        ],
      },
      {
        id: "3",
        startTime: 78,
        endTime: 85,
        context: "Discussion about fitness goals and morning workout routine",
        emotionalTone: "motivated",
        category: "lifestyle",
        confidence: 85,
        clipUrl: videoUrl,
        thumbnailUrl: "",
        recommendations: [
          {
            id: "r4",
            productName: "Premium Membership",
            brandName: "Nike Training Club",
            description: "Personalized workouts and training plans",
            productUrl: "https://nike.com",
            imageUrl: "",
            reasoning:
              "Fitness-focused moment ideal for activewear and training apps",
            relevanceScore: 89,
            selected: true,
          },
        ],
      },
      {
        id: "4",
        startTime: 120,
        endTime: 128,
        context:
          "Creator recommends favorite productivity app for time management",
        emotionalTone: "neutral",
        category: "productivity",
        confidence: 90,
        clipUrl: videoUrl,
        thumbnailUrl: "",
        recommendations: [
          {
            id: "r5",
            productName: "Todoist Premium",
            brandName: "Todoist",
            description: "Advanced task management and productivity features",
            productUrl: "https://todoist.com",
            imageUrl: "",
            reasoning:
              "Direct product mention creates natural ad placement opportunity",
            relevanceScore: 94,
            selected: true,
          },
        ],
      },
    ];
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);

    // Simulate processing with demo data
    setTimeout(() => {
      const demoMoments: AdMoment[] = generateDemoMoments();

      setAdMoments(demoMoments);
      setIsProcessing(false);
      setIsAnalyzed(true);
      setSelectedMoment(demoMoments[0]);
    }, 3000);
  };

  const handleExportReport = () => {
    const reportData = adMoments.map((moment, index) => ({
      momentNumber: index + 1,
      timestamp: `${Math.floor(moment.startTime / 60)}:${(moment.startTime % 60)
        .toString()
        .padStart(2, "0")} - ${Math.floor(moment.endTime / 60)}:${(
        moment.endTime % 60
      )
        .toString()
        .padStart(2, "0")}`,
      context: moment.context,
      tone: moment.emotionalTone,
      category: moment.category,
      confidence: `${moment.confidence}%`,
      recommendedAds: moment.recommendations
        .filter((r) => r.selected)
        .map((r) => `${r.brandName} - ${r.productName}`)
        .join(", "),
    }));

    const csv = [
      [
        "Moment #",
        "Timestamp",
        "Context",
        "Tone",
        "Category",
        "Confidence",
        "Recommended Ads",
      ].join(","),
      ...reportData.map((row) =>
        [
          row.momentNumber,
          row.timestamp,
          `"${row.context}"`,
          row.tone,
          row.category,
          row.confidence,
          `"${row.recommendedAds}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "momentmatch-ad-report.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">MomentMatch AI</h1>
          </div>

          {isAnalyzed && (
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!file && !isAnalyzed && (
          <>
            {/* Mode Toggle */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setMode("select")}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  mode === "select"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                Select from Library
              </button>
              <button
                onClick={() => setMode("upload")}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  mode === "upload"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                Upload New Video
              </button>
            </div>

            {/* Video Library */}
            {mode === "select" && (
              <VideoLibrary onVideoSelect={handleVideoLibrarySelect} />
            )}
          </>
        )}

        {!file && mode === "upload" && !isAnalyzed && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Upload Your Video
            </h2>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-700 rounded-2xl p-16 hover:border-indigo-500/50 bg-gray-800/50 transition-all cursor-pointer"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Upload className="w-10 h-10 text-white" />
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Select or drag your video file
                  </h3>
                  <p className="text-gray-400">
                    Supports MP4, MOV, AVI up to 2GB
                  </p>
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) handleFileSelect(selectedFile);
              }}
              className="hidden"
            />
          </div>
        )}

        {file && !isAnalyzed && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">
                Video Preview
              </h3>

              {!isProcessing ? (
                <>
                  <video
                    src={videoUrl}
                    controls
                    className="w-full rounded-lg mb-6"
                  />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 mb-1">Filename</p>
                      <p className="text-white font-medium">{file.name}</p>
                    </div>

                    <button
                      onClick={handleUpload}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105"
                    >
                      <TrendingUp className="w-5 h-5" />
                      Start Analysis
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-12">
                  <h4 className="text-xl font-bold text-white text-center mb-8">
                    Analyzing Your Content...
                  </h4>
                  <ProcessingAnimation />
                  <p className="text-center text-gray-400 mt-8 text-sm">
                    This may take a few moments. We&apos;re understanding every
                    frame, word, and emotion.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {isAnalyzed && (
          <div className="space-y-6">
            {/* Video Player */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <video
                src={videoUrl}
                controls
                className="w-full rounded-lg"
                onTimeUpdate={(e) =>
                  setCurrentTime(e.currentTarget.currentTime)
                }
              />
            </div>

            {/* Timeline */}
            <VideoTimeline
              moments={adMoments}
              currentTime={currentTime}
              onMomentClick={setSelectedMoment}
              selectedMoment={selectedMoment}
            />

            {/* Moments Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adMoments.map((moment) => (
                <MomentCard
                  key={moment.id}
                  moment={moment}
                  isSelected={selectedMoment?.id === moment.id}
                  onClick={() => setSelectedMoment(moment)}
                />
              ))}
            </div>

            {/* Selected Moment Detail */}
            {selectedMoment && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Ad Recommendations
                </h3>

                <div className="space-y-4">
                  {selectedMoment.recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className={`p-6 border rounded-xl transition-all ${
                        rec.selected
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-gray-700 bg-gray-900/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-white">
                            {rec.productName}
                          </h4>
                          <p className="text-indigo-400">{rec.brandName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                            {rec.relevanceScore}% Match
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-300 mb-4">{rec.description}</p>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400 italic">
                          {rec.reasoning}
                        </p>
                        <a
                          href={rec.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                        >
                          Learn More
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
