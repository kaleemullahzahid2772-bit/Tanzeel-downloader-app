import type { SupportedPlatform } from './VideoItem';

export type HistorySortOption = 'NEWEST' | 'OLDEST' | 'LARGEST' | 'SMALLEST' | 'NAME_ASC';

export interface HistoryItem {
  id: string;
  title: string;
  filename: string;
  platform: SupportedPlatform;
  url: string;
  thumbnailUrl: string;
  fileSize: string;
  fileSizeBytes: number;
  quality: string;
  format: 'mp4' | 'mp3' | 'webm';
  status: 'completed' | 'failed' | 'downloading';
  progressPercent: number;
  timestamp: string; // ISO format
  completedTimestamp?: string;
  errorMessage?: string;
  isMockData?: boolean;
  uriValid?: boolean;
}
