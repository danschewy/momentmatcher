// Utility functions for MomentMatch AI

export function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function getEmotionColor(emotion: string): string {
  const colors: Record<string, string> = {
    excited: "text-yellow-400",
    positive: "text-green-400",
    neutral: "text-blue-400",
    negative: "text-red-400",
    motivated: "text-purple-400",
  };
  return colors[emotion] || "text-gray-400";
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    educational: "📚",
    technology: "💻",
    lifestyle: "🌟",
    entertainment: "🎬",
    productivity: "⚡",
    product: "🛍️",
  };
  return icons[category] || "🎯";
}

export function generateMomentId(startTime: number, endTime: number): string {
  return `moment_${startTime}_${endTime}_${Date.now()}`;
}

export function validateVideoFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
  const allowedTypes = [
    "video/mp4",
    "video/mov",
    "video/avi",
    "video/quicktime",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Please upload MP4, MOV, or AVI files.",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File too large. Maximum size is 2GB.",
    };
  }

  return { valid: true };
}

export function calculateRelevanceScore(
  confidence: number,
  emotionalIntensity: number
): number {
  // Weighted average: 70% confidence, 30% emotional intensity
  return Math.round(confidence * 0.7 + emotionalIntensity * 0.3);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
