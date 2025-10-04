"use client";

import { useState, useEffect } from "react";
import { Video, Clock, Calendar, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TwelveLabsVideo {
  _id: string;
  created_at: string;
  duration: number;
  metadata?: {
    filename?: string;
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
          {videos.map((video) => (
            <button
              key={video._id}
              onClick={() =>
                onVideoSelect(
                  selectedIndex!,
                  video._id,
                  video.metadata?.filename || "Unknown Video"
                )
              }
              className="p-4 bg-gray-900/50 border border-gray-700 rounded-xl hover:border-indigo-500 transition-all text-left group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/30 transition">
                  <Video className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">
                    {video.metadata?.filename || "Untitled Video"}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {video._id.slice(0, 8)}...
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(video.duration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(new Date(video.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
