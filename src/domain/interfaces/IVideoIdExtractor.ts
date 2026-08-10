import type { PlatformType } from '../models/PlatformType';

export interface IVideoIdExtractor {
  extractVideoId(normalizedUrl: string, platform: PlatformType): string | null;
}
