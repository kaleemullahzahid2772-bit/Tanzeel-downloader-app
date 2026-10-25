import type { IVideoIdExtractor } from '../../domain/interfaces/IVideoIdExtractor';
import { PlatformType } from '../../domain/models/PlatformType';

export class VideoIdExtractor implements IVideoIdExtractor {
  public extractVideoId(normalizedUrl: string, platform: PlatformType): string | null {
    if (!normalizedUrl) return null;

    try {
      const parsed = new URL(normalizedUrl);
      const pathname = parsed.pathname;

      switch (platform) {
        case PlatformType.YOUTUBE:
          // youtube.com/watch?v=ID
          if (parsed.searchParams.has('v')) {
            return parsed.searchParams.get('v');
          }
          // youtu.be/ID
          if (parsed.hostname.includes('youtu.be')) {
            const id = pathname.substring(1).split('/')[0];
            return id || null;
          }
          // youtube.com/shorts/ID or /live/ID
          const ytMatch = pathname.match(/\/(shorts|live)\/([a-zA-Z0-9_-]+)/i);
          if (ytMatch && ytMatch[2]) {
            return ytMatch[2];
          }
          return null;

        case PlatformType.TIKTOK:
          // tiktok.com/@user/video/ID
          const ttMatch = pathname.match(/\/video\/(\d+)/i);
          if (ttMatch && ttMatch[1]) {
            return ttMatch[1];
          }
          return null;

        case PlatformType.FACEBOOK:
          // facebook.com/watch/?v=ID
          if (parsed.searchParams.has('v')) {
            return parsed.searchParams.get('v');
          }
          // facebook.com/.../videos/ID/
          const fbMatch = pathname.match(/\/videos\/(\d+)/i);
          if (fbMatch && fbMatch[1]) {
            return fbMatch[1];
          }
          return null;

        case PlatformType.INSTAGRAM:
          // instagram.com/reel/ID/ or /p/ID/ or /tv/ID/
          const igMatch = pathname.match(/\/(reel|p|tv)\/([a-zA-Z0-9_-]+)/i);
          if (igMatch && igMatch[2]) {
            return igMatch[2];
          }
          return null;

        case PlatformType.PINTEREST:
          // pinterest.com/pin/ID/ or pin.it/ID
          const pinMatch = pathname.match(/\/(?:pin\/)?([a-zA-Z0-9_-]+)/i);
          if (pinMatch && pinMatch[1]) {
            return pinMatch[1];
          }
          return null;

        default:
          return null;
      }
    } catch {
      return null;
    }
  }
}

export const videoIdExtractor = new VideoIdExtractor();
