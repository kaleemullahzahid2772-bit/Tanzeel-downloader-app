import type { SupportedPlatform } from './VideoItem';

export type DownloadStatus = 'idle' | 'downloading' | 'completed' | 'failed';

export interface DownloadTask {
  id: string;
  title: string;
  platform: SupportedPlatform;
  url: string;
  thumbnailUrl: string;
  fileSize: string;
  quality: string;
  format: 'mp4' | 'mp3' | 'webm';
  status: DownloadStatus;
  progressPercent: number;
  downloadSpeed?: string;
  timestamp: string;
  errorMessage?: string;
  isMockData: boolean;
}
