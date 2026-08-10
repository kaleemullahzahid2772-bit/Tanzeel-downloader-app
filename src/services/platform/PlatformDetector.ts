import type { IPlatformDetector } from '../../domain/interfaces/IPlatformDetector';
import { PlatformType } from '../../domain/models/PlatformType';

export class PlatformDetector implements IPlatformDetector {
  public detect(normalizedUrl: string): PlatformType {
    if (!normalizedUrl) return PlatformType.UNKNOWN;

    try {
      const parsed = new URL(normalizedUrl);
      const host = parsed.hostname.toLowerCase();

      // YouTube Detection
      if (host.includes('youtube.com') || host.includes('youtu.be')) {
        return PlatformType.YOUTUBE;
      }

      // TikTok Detection
      if (
        host.includes('tiktok.com') ||
        host.includes('vm.tiktok.com') ||
        host.includes('vt.tiktok.com')
      ) {
        return PlatformType.TIKTOK;
      }

      // Facebook Detection
      if (
        host.includes('facebook.com') ||
        host.includes('fb.watch') ||
        host.includes('fb.com')
      ) {
        return PlatformType.FACEBOOK;
      }

      // Instagram Detection
      if (host.includes('instagram.com') || host.includes('instagr.am')) {
        return PlatformType.INSTAGRAM;
      }

      return PlatformType.UNKNOWN;
    } catch {
      return PlatformType.UNKNOWN;
    }
  }
}

export const platformDetector = new PlatformDetector();
