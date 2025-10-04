"use client";

import { useState, useRef } from "react";
import { Upload, Target, TrendingUp, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import VideoTimeline from "@/components/VideoTimeline";
import MomentCard from "@/components/MomentCard";
import ProcessingAnimation from "@/components/ProcessingAnimation";
import VideoLibrary from "@/components/VideoLibrary";
import HLSVideoPlayer from "@/components/HLSVideoPlayer";
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
  const [brandMentions, setBrandMentions] = useState<
    Array<{
      timestamp: string;
      timeInSeconds: number;
      description: string;
      type: "brand_mention" | "ad_opportunity";
      recommendations?: Array<{
        productName: string;
        brandName: string;
        description: string;
        productUrl: string;
        imageUrl?: string;
        reasoning: string;
        relevanceScore: number;
      }>;
    }>
  >([]);
  const [selectedVideoInfo, setSelectedVideoInfo] = useState<{
    indexId: string;
    videoId: string;
    filename: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setVideoUrl(url);
    setMode("upload");
  };

  const handleVideoLibrarySelect = async (
    indexId: string,
    videoId: string,
    filename: string
  ) => {
    setMode("select");
    setSelectedVideoInfo({ indexId, videoId, filename });
    setIsProcessing(true);

    try {
      // Fetch video details including HLS URL
      const videoResponse = await fetch(
        `/api/indexes/${indexId}/videos/${videoId}`
      );
      const videoData = await videoResponse.json();

      console.log("Video data received:", videoData);

      // According to Twelve Labs docs, HLS structure is at top level
      if (videoData.video?.hls?.video_url) {
        console.log("Setting video URL:", videoData.video.hls.video_url);
        setVideoUrl(videoData.video.hls.video_url);
      } else {
        console.warn("No HLS URL found in video data:", videoData);
        alert(
          "This video doesn't have HLS streaming enabled. Please ensure videos are uploaded with enable_video_stream=true"
        );
        setIsProcessing(false);
        return;
      }

      // Trigger real analysis
      const analysisResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indexId, videoId }),
      });

      const analysisData = await analysisResponse.json();
      console.log("Analysis data received:", analysisData);
      console.log("First moment:", analysisData.moments?.[0]);
      console.log(
        "First moment recommendations:",
        analysisData.moments?.[0]?.recommendations
      );
      console.log("Brand mentions:", analysisData.brandMentions);

      if (analysisData.moments && analysisData.moments.length > 0) {
        setAdMoments(analysisData.moments);
        setSelectedMoment(analysisData.moments[0]);
        console.log(
          "Set moments, first moment has",
          analysisData.moments[0].recommendations?.length,
          "recommendations"
        );
      }

      // Set brand mentions
      if (analysisData.brandMentions) {
        setBrandMentions(analysisData.brandMentions);
        console.log(`Set ${analysisData.brandMentions.length} brand mentions`);
      } else {
        console.warn("No moments found in analysis");
      }

      setIsAnalyzed(true);
    } catch (error) {
      console.error("Error analyzing video:", error);
      alert("Failed to analyze video. Please try again.");
    } finally {
      setIsProcessing(false);
    }
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

  const pollVideoStatus = async (
    videoId: string,
    indexId: string
  ): Promise<boolean> => {
    const maxAttempts = 60; // 5 minutes
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const statusResponse = await fetch(`/api/videos/${videoId}/status`);
        const statusData = await statusResponse.json();

        console.log(
          `Video status check (attempt ${attempts + 1}):`,
          statusData
        );

        if (statusData.status === "completed") {
          console.log("Video indexing complete!");
          return true;
        }

        if (statusData.status === "failed") {
          throw new Error(statusData.error || "Video indexing failed");
        }

        // Still processing, wait and try again
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
        attempts++;
      } catch (error) {
        console.error("Error polling video status:", error);
        throw error;
      }
    }

    throw new Error(
      "Video indexing timed out. Please check the video library later."
    );
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);

    try {
      // Upload video to server
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      // Handle error responses
      if (!uploadResponse.ok) {
        if (uploadData.error) {
          alert(
            `${uploadData.error}\n\n${
              uploadData.hint ||
              "Please select a video from the library instead."
            }`
          );
        } else {
          alert("Failed to upload video. Please try again.");
        }
        setIsProcessing(false);
        return;
      }

      if (!uploadData.videoId) {
        throw new Error("Upload succeeded but no video ID returned");
      }

      console.log("Upload response:", uploadData);

      // If video is still processing, poll for completion
      if (
        uploadData.status === "processing" ||
        uploadData.status === "validating"
      ) {
        console.log(
          `Video uploaded, indexing in progress... (${uploadData.estimatedTime})`
        );

        // Poll for status
        const isComplete = await pollVideoStatus(
          uploadData.videoId,
          uploadData.indexId
        );

        if (!isComplete) {
          alert(
            "Video is still processing. You can check the 'Select from Library' section later to analyze it."
          );
          setIsProcessing(false);
          return;
        }
      }

      // Video is ready, proceed with analysis
      console.log("Video ready, starting analysis...");
      await handleVideoLibrarySelect(
        uploadData.indexId,
        uploadData.videoId,
        file.name
      );
    } catch (error) {
      console.error("Error uploading video:", error);
      alert(
        `Failed to upload video: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessing(false);
    }
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

            {/* Info about upload */}
            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <p className="text-blue-300 text-sm">
                <strong>📤 Direct Upload:</strong> Upload videos directly from
                your computer (max 2GB, 360x360 to 3840x2160 resolution).
                Processing may take several minutes depending on video length.
              </p>
            </div>

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
                  <HLSVideoPlayer
                    src={videoUrl}
                    className="w-full rounded-lg mb-6"
                    controls
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
              <h3 className="text-2xl font-bold text-white mb-4">
                {selectedVideoInfo?.filename || file?.name || "Video"}
              </h3>
              <HLSVideoPlayer
                src={videoUrl}
                className="w-full rounded-lg"
                controls
                onTimeUpdate={setCurrentTime}
              />
            </div>

            {/* Brand Mentions & Ad Opportunities */}
            {brandMentions.length > 0 && (
              <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-700/50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      AI-Detected Brand Mentions & Ad Opportunities
                    </h3>
                    <p className="text-sm text-purple-300">
                      {brandMentions.length} moments identified by AI analysis
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {brandMentions.map((mention, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg transition-all cursor-pointer ${
                        mention.type === "brand_mention"
                          ? "bg-purple-500/10 border border-purple-500/30 hover:border-purple-500/50"
                          : "bg-indigo-500/10 border border-indigo-500/30 hover:border-indigo-500/50"
                      }`}
                      onClick={() => {
                        // Seek to this timestamp in the video
                        const videoElement = document.querySelector("video");
                        if (videoElement) {
                          videoElement.currentTime = mention.timeInSeconds;
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              mention.type === "brand_mention"
                                ? "bg-purple-600 text-white"
                                : "bg-indigo-600 text-white"
                            }`}
                          >
                            {mention.type === "brand_mention"
                              ? "🏷️ Brand Mention"
                              : "⚡ Ad Opportunity"}
                          </span>
                          <span className="text-purple-300 font-mono text-sm">
                            {mention.timestamp}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed mb-3">
                        {mention.description}
                      </p>

                      {/* Product Recommendations */}
                      {mention.recommendations &&
                        mention.recommendations.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-purple-500/20">
                            <h4 className="text-xs font-semibold text-purple-300 uppercase mb-3">
                              💡 Recommended Products (
                              {mention.recommendations.length})
                            </h4>
                            <div className="space-y-2">
                              {mention.recommendations.map((rec, recIdx) => (
                                <div
                                  key={recIdx}
                                  className="p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
                                  onClick={(e) => e.stopPropagation()} // Prevent video seek when clicking
                                >
                                  <div className="flex items-start justify-between mb-1">
                                    <div className="flex-1">
                                      <h5 className="text-sm font-semibold text-white">
                                        {rec.productName}
                                      </h5>
                                      <p className="text-xs text-purple-300">
                                        {rec.brandName}
                                      </p>
                                    </div>
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium ml-2">
                                      {rec.relevanceScore}%
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-400 mb-2">
                                    {rec.description}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500 italic">
                                      {rec.reasoning}
                                    </p>
                                    <a
                                      href={rec.productUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition ml-2 flex-shrink-0"
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
                  ))}
                </div>
              </div>
            )}

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
                  {selectedMoment.recommendations.length > 0 && (
                    <span className="ml-3 text-sm text-gray-400">
                      ({selectedMoment.recommendations.length} recommendations)
                    </span>
                  )}
                </h3>

                {selectedMoment.recommendations.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No recommendations available for this moment yet.
                  </p>
                ) : (
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
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
