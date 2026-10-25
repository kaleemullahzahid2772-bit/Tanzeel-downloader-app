export type SupportedPlatform = 'youtube' | 'tiktok' | 'facebook' | 'instagram' | 'pinterest' | 'unknown';

export interface VideoQualityOption {
  label: string; // e.g. '1080p Full HD', '720p HD', '480p SD', '128kbps Audio MP3'
  resolution: string; // '1080p' | '720p' | '480p' | 'audio'
  estimatedSize: string; // e.g. '45.2 MB'
  format: 'mp4' | 'mp3' | 'webm';
  isAudioOnly?: boolean;
}

export interface VideoAnalysisResult {
  url: string;
  platform: SupportedPlatform;
  title: string;
  author: string;
  thumbnailUrl: string;
  duration: string; // e.g. '03:45'
  qualities: VideoQualityOption[];
  analyzedAt: string;
  isMockData: true; // Explicit flag for Phase 1 demo data
}
