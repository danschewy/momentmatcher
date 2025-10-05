"use client";

import { useState, useEffect } from "react";
import { Video, Calendar, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TwelveLabsVideo {
  _id: string;
  created_at: string;
  system_metadata?: {
    duration?: number;
    filename?: string;
  };
  hls?: {
    video_url: string;
    thumbnail_urls?: string[];
    status: string;
    updated_at: string;
  };
}

interface TwelveLabsIndex {
  _id: string;
  index_name: string;
  video_count?: number;
}

interface VideoLibraryProps {
  onVideoSelect: (indexId: string, videoId: string, filename: string) => void;
}

export default function VideoLibrary({ onVideoSelect }: VideoLibraryProps) {
  const [indexes, setIndexes] = useState<TwelveLabsIndex[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);
  const [videos, setVideos] = useState<TwelveLabsVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingVideoId, setProcessingVideoId] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchIndexes();
  }, []);

  useEffect(() => {
    if (selectedIndex) {
      fetchVideos(selectedIndex);
    }
  }, [selectedIndex]);

  const fetchIndexes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/indexes");
      const data = await response.json();

      if (response.ok) {
        setIndexes(data.indexes);
        if (data.indexes.length > 0) {
          setSelectedIndex(data.indexes[0]._id);
        }
      } else {
        setError(data.error || "Failed to fetch indexes");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVideos = async (indexId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/indexes/${indexId}/videos`);
      const data = await response.json();

      if (response.ok) {
        setVideos(data.videos);
      } else {
        setError(data.error || "Failed to fetch videos");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
        <p className="text-red-400 text-center">
          {error === "TWELVE_LABS_API_KEY is not set"
            ? "Twelve Labs API key not configured. Using demo mode."
            : error}
        </p>
      </div>
    );
  }

  if (isLoading && indexes.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-gray-400">Loading your video library...</p>
        </div>
      </div>
    );
  }

  if (indexes.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
        <p className="text-gray-400 text-center">
          No indexes found. Upload a video to create your first index.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Video Library</h3>
          <p className="text-sm text-gray-400 mt-1">
            Select a previously uploaded video to analyze
          </p>
        </div>

        {/* Index selector */}
        {indexes.length > 1 && (
          <select
            value={selectedIndex || ""}
            onChange={(e) => setSelectedIndex(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          >
            {indexes.map((index) => (
              <option key={index._id} value={index._id}>
                {index.index_name} ({index.video_count || 0} videos)
              </option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
      ) : videos.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          No videos in this index yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => {
            const isProcessing = processingVideoId === video._id;
            return (
              <button
                key={video._id}
                onClick={() => {
                  setProcessingVideoId(video._id);
                  onVideoSelect(
                    selectedIndex!,
                    video._id,
                    video.system_metadata?.filename || "Unknown Video"
                  );
                }}
                disabled={isProcessing || processingVideoId !== null}
                className={`bg-gray-900/50 border border-gray-700 rounded-xl transition-all text-left group overflow-hidden ${
                  isProcessing
                    ? "border-indigo-500 ring-2 ring-indigo-500/50"
                    : processingVideoId !== null
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-indigo-500"
                }`}
              >
                {/* Video Thumbnail */}
                <div className="relative w-full h-40 bg-gray-800 overflow-hidden">
                  {video.hls?.thumbnail_urls?.[0] ? (
                    <img
                      src={video.hls.thumbnail_urls[0]}
                      alt={video.system_metadata?.filename || "Video thumbnail"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <Video className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.system_metadata?.duration || 0)}
                  </div>

                  {/* Loading overlay */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                      <span className="text-white text-sm font-medium">
                        Loading...
                      </span>
                    </div>
                  )}

                  {/* Hover overlay (only show when not processing) */}
                  {!isProcessing && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/0 group-hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                        <Video className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h4 className="font-medium text-white truncate mb-1">
                    {video.system_metadata?.filename || "Untitled Video"}
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    ID: {video._id.slice(0, 8)}...
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {formatDistanceToNow(new Date(video.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {video.hls?.status && (
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          video.hls.status === "COMPLETE"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {video.hls.status}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
