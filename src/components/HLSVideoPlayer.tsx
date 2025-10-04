"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface HLSVideoPlayerProps {
  src: string;
  className?: string;
  onTimeUpdate?: (time: number) => void;
  controls?: boolean;
  autoPlay?: boolean;
  poster?: string;
}

export default function HLSVideoPlayer({
  src,
  className = "",
  onTimeUpdate,
  controls = true,
  autoPlay = false,
  poster,
}: HLSVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Parse time fragment from URL (e.g., #t=10,20)
    let baseUrl = src;
    let startTime: number | undefined;
    let endTime: number | undefined;

    if (src.includes("#t=")) {
      const [url, fragment] = src.split("#t=");
      baseUrl = url;
      const times = fragment.split(",");
      startTime = parseFloat(times[0]);
      endTime = times[1] ? parseFloat(times[1]) : undefined;
      console.log(`Time fragment detected: ${startTime}s to ${endTime}s`);
    }

    // Check if HLS is supported
    if (Hls.isSupported()) {
      // Destroy previous instance if exists
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      // Create new HLS instance
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hlsRef.current = hls;

      // Load the source (without fragment)
      hls.loadSource(baseUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest parsed, video ready to play");

        // Seek to start time if specified
        if (startTime !== undefined) {
          video.currentTime = startTime;
          console.log(`Seeking to ${startTime}s`);
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Fatal network error, trying to recover");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Fatal media error, trying to recover");
              hls.recoverMediaError();
              break;
            default:
              console.error("Unrecoverable error, destroying HLS instance");
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari) - it handles #t= fragments natively
      video.src = src;
    } else {
      console.error("HLS is not supported in this browser");
    }

    // Handle end time for clipped playback
    const handleTimeCheck = () => {
      if (endTime && video.currentTime >= endTime) {
        video.pause();
        video.currentTime = startTime || 0; // Reset to start
      }
    };

    if (endTime) {
      video.addEventListener("timeupdate", handleTimeCheck);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (endTime) {
        video.removeEventListener("timeupdate", handleTimeCheck);
      }
    };
  }, [src]);

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  return (
    <video
      ref={videoRef}
      className={className}
      controls={controls}
      autoPlay={autoPlay}
      poster={poster}
      onTimeUpdate={handleTimeUpdate}
      playsInline
    />
  );
}
