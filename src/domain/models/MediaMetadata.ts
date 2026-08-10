import type { SupportedPlatform } from './VideoItem';

export interface MediaMetadata {
  originalUrl: string;
  normalizedUrl: string;
  platform: SupportedPlatform;
  title: string;
  thumbnailUrl: string;
  durationSeconds: number;
  author: string;
  formats: {
    formatId: string;
    quality: string;
    container: string;
    url: string;
  }[];
}
