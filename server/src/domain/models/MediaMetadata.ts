export interface MediaFormat {
  formatId: string;
  resolution: string; // e.g. '1080p', '720p', '480p', 'audio'
  container: 'mp4' | 'mp3' | 'webm';
  qualityLabel: string; // e.g. '1080p Full HD (MP4)'
  estimatedSizeBytes: number; // in bytes
  estimatedSizeFormatted: string; // e.g. '45.2 MB'
  isAudioOnly: boolean;
  downloadUrl?: string;
  url?: string;
}

export interface MediaMetadata {
  url: string;
  normalizedUrl: string;
  platform: 'youtube' | 'tiktok' | 'facebook' | 'instagram' | 'pinterest' | 'unknown';
  platformName: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  durationSeconds: number;
  durationFormatted: string;
  formats: MediaFormat[];
  analyzedAt: string;
}
