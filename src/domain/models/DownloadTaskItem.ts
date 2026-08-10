import type { SupportedPlatform } from './VideoItem';
import type { TaskState } from './TaskState';

export interface DownloadTaskItem {
  id: string;
  url: string;
  normalizedUrl: string;
  title: string;
  platform: SupportedPlatform;
  quality: string;
  format: 'mp4' | 'mp3' | 'webm';
  thumbnailUrl: string;
  state: TaskState;
  downloadedBytes: number;
  totalBytes: number;
  progressPercent: number; // 0 to 100
  speedBytesPerSec: number;
  etaSeconds: number | null;
  timestamp: string; // ISO String
  completedTimestamp?: string;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  tempFilePath?: string;
  finalFilePath?: string;
  contentUri?: string;
}
