"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Upload, Target, TrendingUp, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import VideoTimeline from "@/components/VideoTimeline";
import MomentCard from "@/components/MomentCard";
import ProcessingAnimation from "@/components/ProcessingAnimation";
import VideoLibrary from "@/components/VideoLibrary";
import HLSVideoPlayer from "@/components/HLSVideoPlayer";
import { AdMoment } from "@/types";

function AnalyzePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState<"select" | "upload">("select"); // New state for mode
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedMoment, setSelectedMoment] = useState<AdMoment | null>(null);
  const [adMoments, setAdMoments] = useState<AdMoment[]>([]);
  const [activeTab, setActiveTab] = useState<"brandMentions" | "adMoments">(
    "brandMentions"
  );
  const [brandMentions, setBrandMentions] = useState<
    Array<{
      timestamp: string;
      timeInSeconds: number;
      description: string;
      type: "brand_mention" | "ad_opportunity";
      engagementScore?: number | null;
      attentionScore?: number | null;
      placementTier?: string | null;
      estimatedCpmMin?: number | null;
      estimatedCpmMax?: number | null;
      categoryTags?: string | null;
      recommendations?: Array<{
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
      }>;
    }>
  >([]);
  const [selectedVideoInfo, setSelectedVideoInfo] = useState<{
    indexId: string;
    videoId: string;
    filename: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasLoadedFromUrl = useRef(false);

  // Load video from URL parameter on mount
  useEffect(() => {
    const videoId = searchParams.get("videoId");
    const indexId = searchParams.get("indexId");

    if (videoId && indexId && !hasLoadedFromUrl.current && !isAnalyzed) {
      hasLoadedFromUrl.current = true;
      console.log(`Loading video from URL: ${videoId}`);

      // Fetch video info first
      fetch(`/api/indexes/${indexId}/videos/${videoId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.video) {
            handleVideoLibrarySelect(
              indexId,
              videoId,
              data.video.metadata?.filename || "Video"
            );
          }
        })
        .catch((error) => {
          console.error("Failed to load video from URL:", error);
        });
    }
  }, [searchParams, isAnalyzed]);

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
    setProcessingStatus("Checking video status...");

    try {
      // First, check if video is fully indexed
      const dbStatusResponse = await fetch(`/api/videos/${videoId}/status`);
      const dbStatus = await dbStatusResponse.json();

      console.log("Video DB status:", dbStatus);

      // If not completed, poll until ready
      if (dbStatus.status !== "completed") {
        setProcessingStatus(
          "Video is still indexing... This may take 1-5 minutes."
        );
        console.log("Video not ready, polling for completion...");

        const isReady = await pollVideoStatus(videoId);
        if (!isReady) {
          alert("Video indexing timed out. Please try again later.");
          setIsProcessing(false);
          setProcessingStatus("");
          return;
        }
      }

      // Video is indexed, now fetch video details including HLS URL
      setProcessingStatus("Loading video...");
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
        setProcessingStatus("");
        return;
      }

      // Trigger real analysis
      setProcessingStatus(
        "Analyzing video moments and detecting ad opportunities..."
      );
      const analysisResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indexId, videoId }),
      });

      const analysisData = await analysisResponse.json();
      console.log("Analysis data received:", analysisData);
      console.log("First moment:", analysisData.moments?.[0]);
      console.log(
        "First moment placementTier:",
        analysisData.moments?.[0]?.placementTier
      );
      console.log(
        "First moment engagement:",
        analysisData.moments?.[0]?.engagementScore
      );
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

      // Set brand mentions and sort by timestamp
      if (analysisData.brandMentions) {
        const sortedMentions = [...analysisData.brandMentions].sort(
          (a, b) => a.timeInSeconds - b.timeInSeconds
        );
        setBrandMentions(sortedMentions);
        console.log(
          `Set ${sortedMentions.length} brand mentions (sorted by timestamp)`
        );
      } else {
        console.warn("No moments found in analysis");
      }

      setIsAnalyzed(true);

      // Update URL with video parameters for easy linking back
      const currentVideoId = searchParams.get("videoId");
      if (currentVideoId !== videoId) {
        router.push(`/analyze?videoId=${videoId}&indexId=${indexId}`, {
          scroll: false,
        });
      }
    } catch (error) {
      console.error("Error analyzing video:", error);
      alert("Failed to analyze video. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  const pollVideoStatus = async (videoId: string): Promise<boolean> => {
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
    setProcessingStatus("Uploading video to Twelve Labs...");

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
        setProcessingStatus("");
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
        setProcessingStatus(
          `Indexing video... (${uploadData.estimatedTime || "1-5 minutes"})`
        );
        console.log(
          `Video uploaded, indexing in progress... (${uploadData.estimatedTime})`
        );

        // Poll for status
        const isComplete = await pollVideoStatus(uploadData.videoId);

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
      setProcessingStatus("");
    }
  };

  const handleExportReport = () => {
    const rows: string[][] = [];

    // Header - Enhanced with spot quality metrics
    rows.push([
      "Type",
      "Timestamp",
      "Context/Description",
      "Category/Type",
      "Confidence",
      "Engagement Score",
      "Attention Score",
      "Placement Tier",
      "Spot CPM Min",
      "Spot CPM Max",
      "Product Name",
      "Brand",
      "Product URL",
      "Relevance Score",
      "Product CPM",
      "Product CTR",
      "Projected Revenue",
    ]);

    // Add ad moments
    adMoments.forEach((moment) => {
      const timestamp = `${Math.floor(moment.startTime / 60)}:${(
        moment.startTime % 60
      )
        .toString()
        .padStart(2, "0")} - ${Math.floor(moment.endTime / 60)}:${(
        moment.endTime % 60
      )
        .toString()
        .padStart(2, "0")}`;

      if (moment.recommendations && moment.recommendations.length > 0) {
        moment.recommendations.forEach((rec) => {
          rows.push([
            "Ad Moment",
            timestamp,
            `"${moment.context.replace(/"/g, '""')}"`,
            moment.category || "general",
            `${moment.confidence}%`,
            moment.engagementScore ? `${moment.engagementScore}%` : "",
            moment.attentionScore ? `${moment.attentionScore}%` : "",
            moment.placementTier || "",
            moment.estimatedCpmMin
              ? `$${(moment.estimatedCpmMin / 100).toFixed(2)}`
              : "",
            moment.estimatedCpmMax
              ? `$${(moment.estimatedCpmMax / 100).toFixed(2)}`
              : "",
            rec.productName || "",
            rec.brandName || "",
            rec.productUrl || "",
            `${rec.relevanceScore}%`,
            rec.estimatedCPM ? `$${rec.estimatedCPM.toFixed(2)}` : "",
            rec.estimatedCTR ? `${(rec.estimatedCTR / 10).toFixed(1)}%` : "",
            rec.projectedRevenue
              ? `$${(rec.projectedRevenue / 100).toFixed(2)}`
              : "",
          ]);
        });
      } else {
        rows.push([
          "Ad Moment",
          timestamp,
          `"${moment.context.replace(/"/g, '""')}"`,
          moment.category || "general",
          `${moment.confidence}%`,
          moment.engagementScore ? `${moment.engagementScore}%` : "",
          moment.attentionScore ? `${moment.attentionScore}%` : "",
          moment.placementTier || "",
          moment.estimatedCpmMin
            ? `$${(moment.estimatedCpmMin / 100).toFixed(2)}`
            : "",
          moment.estimatedCpmMax
            ? `$${(moment.estimatedCpmMax / 100).toFixed(2)}`
            : "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ]);
      }
    });

    // Add brand mentions
    brandMentions.forEach((mention) => {
      if (mention.recommendations && mention.recommendations.length > 0) {
        mention.recommendations.forEach((rec) => {
          rows.push([
            mention.type === "brand_mention"
              ? "Brand Mention"
              : "Ad Opportunity",
            mention.timestamp,
            `"${mention.description.replace(/"/g, '""')}"`,
            mention.type,
            "N/A",
            mention.engagementScore ? `${mention.engagementScore}%` : "",
            mention.attentionScore ? `${mention.attentionScore}%` : "",
            mention.placementTier || "",
            mention.estimatedCpmMin
              ? `$${(mention.estimatedCpmMin / 100).toFixed(2)}`
              : "",
            mention.estimatedCpmMax
              ? `$${(mention.estimatedCpmMax / 100).toFixed(2)}`
              : "",
            rec.productName || "",
            rec.brandName || "",
            rec.productUrl || "",
            `${rec.relevanceScore}%`,
            rec.estimatedCPM ? `$${rec.estimatedCPM.toFixed(2)}` : "",
            rec.estimatedCTR ? `${(rec.estimatedCTR / 10).toFixed(1)}%` : "",
            rec.projectedRevenue
              ? `$${(rec.projectedRevenue / 100).toFixed(2)}`
              : "",
          ]);
        });
      } else {
        rows.push([
          mention.type === "brand_mention" ? "Brand Mention" : "Ad Opportunity",
          mention.timestamp,
          `"${mention.description.replace(/"/g, '""')}"`,
          mention.type,
          "N/A",
          mention.engagementScore ? `${mention.engagementScore}%` : "",
          mention.attentionScore ? `${mention.attentionScore}%` : "",
          mention.placementTier || "",
          mention.estimatedCpmMin
            ? `$${(mention.estimatedCpmMin / 100).toFixed(2)}`
            : "",
          mention.estimatedCpmMax
            ? `$${(mention.estimatedCpmMax / 100).toFixed(2)}`
            : "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ]);
      }
    });

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // Generate filename with video name and date
    const videoName = selectedVideoInfo?.filename || file?.name || "video";
    const cleanVideoName = videoName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase();
    const dateStr = new Date().toISOString().split("T")[0];
    a.download = `momentmatch-${cleanVideoName}-${dateStr}.csv`;

    a.click();
    URL.revokeObjectURL(url);
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
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV Report
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
            {mode === "select" && !isProcessing && (
              <VideoLibrary onVideoSelect={handleVideoLibrarySelect} />
            )}

            {/* Loading state when selecting from library */}
            {mode === "select" && isProcessing && !isAnalyzed && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-12">
                  <h3 className="text-2xl font-bold text-white text-center mb-8">
                    {processingStatus || "Loading video..."}
                  </h3>
                  <ProcessingAnimation />
                  <p className="text-center text-gray-400 mt-8 text-sm">
                    {processingStatus.includes("indexing")
                      ? "This typically takes 1-5 minutes depending on video length."
                      : processingStatus.includes("Analyzing")
                      ? "AI is analyzing every frame, word, and emotion. This may take a few moments."
                      : "Please wait while we prepare your video..."}
                  </p>
                </div>
              </div>
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
                  {/* Use native video element for blob URL preview */}
                  <video
                    src={videoUrl}
                    className="w-full rounded-lg mb-6"
                    controls
                    playsInline
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
                      Upload & Analyze
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-12">
                  <h4 className="text-xl font-bold text-white text-center mb-8">
                    {processingStatus || "Processing..."}
                  </h4>
                  <ProcessingAnimation />
                  <p className="text-center text-gray-400 mt-8 text-sm">
                    {processingStatus.includes("Indexing")
                      ? "This typically takes 1-5 minutes depending on video length."
                      : "This may take a few moments. We're understanding every frame, word, and emotion."}
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white">
                  {selectedVideoInfo?.filename || file?.name || "Video"}
                </h3>
                <Link
                  href={`/dashboard/${selectedVideoInfo?.videoId || ""}`}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  View Dashboard
                </Link>
              </div>
              <HLSVideoPlayer
                src={videoUrl}
                className="w-full rounded-lg"
                controls
                onTimeUpdate={setCurrentTime}
              />
            </div>

            {/* Tab Navigation */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("brandMentions")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      activeTab === "brandMentions"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                        : "bg-gray-700/50 text-gray-400 hover:text-white"
                    }`}
                  >
                    🎯 Brand Mentions ({brandMentions.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("adMoments")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      activeTab === "adMoments"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "bg-gray-700/50 text-gray-400 hover:text-white"
                    }`}
                  >
                    📺 Ad Moments ({adMoments.length})
                  </button>
                </div>
              </div>

              {/* Brand Mentions Tab */}
              {activeTab === "brandMentions" && brandMentions.length > 0 && (
                <div>
                  <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-sm text-purple-300">
                      ✨ AI-detected moments where brands, products, or
                      high-energy opportunities were identified. Premium spots
                      (gold) have 80%+ engagement.
                    </p>
                  </div>

                  {/* Timeline for Brand Mentions */}
                  <div className="mb-6">
                    <VideoTimeline
                      moments={brandMentions.map((mention) => ({
                        id: `mention-${mention.timeInSeconds}`,
                        startTime: mention.timeInSeconds,
                        endTime: mention.timeInSeconds + 5, // 5 second duration
                        context: mention.description,
                        emotionalTone: "neutral",
                        category: mention.type,
                        confidence: 75,
                        clipUrl: "",
                        thumbnailUrl: "",
                        recommendations: [],
                        engagementScore: mention.engagementScore,
                        attentionScore: mention.attentionScore,
                        placementTier: mention.placementTier,
                        estimatedCpmMin: mention.estimatedCpmMin,
                        estimatedCpmMax: mention.estimatedCpmMax,
                        categoryTags: mention.categoryTags,
                      }))}
                      currentTime={currentTime}
                      onMomentClick={(moment) => {
                        const videoElement = document.querySelector("video");
                        if (videoElement) {
                          videoElement.currentTime = moment.startTime;
                        }
                      }}
                      selectedMoment={null}
                    />
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {brandMentions.map((mention, idx) => {
                      const tierStyle =
                        mention.placementTier === "premium"
                          ? "bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-2 border-yellow-500/40 hover:border-yellow-500/60 shadow-lg shadow-yellow-500/20"
                          : mention.placementTier === "standard"
                          ? "bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-2 border-blue-500/30 hover:border-blue-500/50"
                          : mention.placementTier === "basic"
                          ? "bg-gray-500/10 border border-gray-500/30 hover:border-gray-500/50"
                          : mention.type === "brand_mention"
                          ? "bg-purple-500/10 border border-purple-500/30 hover:border-purple-500/50"
                          : "bg-indigo-500/10 border border-indigo-500/30 hover:border-indigo-500/50";

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg transition-all cursor-pointer ${tierStyle}`}
                          onClick={() => {
                            // Seek to this timestamp in the video
                            const videoElement =
                              document.querySelector("video");
                            if (videoElement) {
                              videoElement.currentTime = mention.timeInSeconds;
                            }
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Type Badge */}
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

                              {/* Placement Tier Badge */}
                              {mention.placementTier && (
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                                    mention.placementTier === "premium"
                                      ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-950 shadow-lg shadow-yellow-500/30"
                                      : mention.placementTier === "standard"
                                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20"
                                      : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                                  }`}
                                >
                                  {mention.placementTier === "premium" && "⭐"}
                                  {mention.placementTier === "standard" && "⚡"}
                                  {mention.placementTier === "basic" && "○"}
                                  <span className="uppercase tracking-wide">
                                    {mention.placementTier}
                                  </span>
                                </span>
                              )}

                              {/* Timestamp */}
                              <span className="text-purple-300 font-mono text-sm">
                                {mention.timestamp}
                              </span>
                            </div>

                            {/* Quality Metrics */}
                            {mention.engagementScore && (
                              <div className="flex gap-3 text-xs">
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-400">
                                    Engagement:
                                  </span>
                                  <span
                                    className={`font-semibold ${
                                      mention.engagementScore >= 80
                                        ? "text-green-400"
                                        : mention.engagementScore >= 60
                                        ? "text-blue-400"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {mention.engagementScore}%
                                  </span>
                                </div>
                                {mention.estimatedCpmMin &&
                                  mention.estimatedCpmMax && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-400">
                                        CPM:
                                      </span>
                                      <span className="text-green-400 font-semibold">
                                        $
                                        {(
                                          mention.estimatedCpmMin / 100
                                        ).toFixed(0)}
                                        -$
                                        {(
                                          mention.estimatedCpmMax / 100
                                        ).toFixed(0)}
                                      </span>
                                    </div>
                                  )}
                              </div>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed mb-3">
                            {mention.description}
                          </p>

                          {/* Category Tags */}
                          {mention.categoryTags && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {mention.categoryTags
                                .split(", ")
                                .map((tag, tagIdx) => (
                                  <span
                                    key={tagIdx}
                                    className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-xs"
                                  >
                                    {tag}
                                  </span>
                                ))}
                            </div>
                          )}

                          {/* Product Recommendations */}
                          {mention.recommendations &&
                            mention.recommendations.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-purple-500/20">
                                <h4 className="text-xs font-semibold text-purple-300 uppercase mb-3">
                                  💡 Recommended Products (
                                  {mention.recommendations.length})
                                </h4>
                                <div className="space-y-2">
                                  {mention.recommendations.map(
                                    (rec, recIdx) => (
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
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ad Moments Tab */}
              {activeTab === "adMoments" && adMoments.length > 0 && (
                <div>
                  <div className="mb-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                    <p className="text-sm text-indigo-300">
                      📺 Contextual ad placement opportunities based on video
                      analysis. Each moment includes emotional tone, category,
                      and confidence score. Premium spots (gold) have 80%+
                      engagement.
                    </p>
                  </div>

                  {/* Timeline - showing all ad moments */}
                  <div className="mb-6">
                    <VideoTimeline
                      moments={adMoments}
                      currentTime={currentTime}
                      onMomentClick={setSelectedMoment}
                      selectedMoment={selectedMoment}
                    />
                  </div>

                  {/* Moments Grid */}
                  <div className="grid md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
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
                            ({selectedMoment.recommendations.length}{" "}
                            recommendations)
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
                                  <p className="text-indigo-400">
                                    {rec.brandName}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                                    {rec.relevanceScore}% Match
                                  </span>
                                </div>
                              </div>

                              <p className="text-gray-300 mb-4">
                                {rec.description}
                              </p>

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
        )}
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <AnalyzePageContent />
    </Suspense>
  );
}
