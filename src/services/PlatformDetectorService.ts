import type { IPlatformDetector } from '../domain/interfaces/IPlatformDetector';
import type { SupportedPlatform } from '../domain/models/VideoItem';
import type { PlatformDetails } from '../domain/models/PlatformInfo';
import { PlatformType } from '../domain/models/PlatformType';

export const PLATFORMS_CONFIG: Record<SupportedPlatform, PlatformDetails> = {
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    tagline: 'Videos & Shorts',
    iconName: 'Youtube',
    badgeBg: 'bg-red-500/10 border-red-500/30 text-red-500',
    badgeTextColor: 'text-red-500',
    accentColor: '#FF0000',
    exampleUrl: 'https://youtube.com/watch?v=...',
    supportedQualities: ['1080p', '720p', '480p', 'Audio MP3'],
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    tagline: 'Short Videos',
    iconName: 'Video',
    badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    badgeTextColor: 'text-cyan-400',
    accentColor: '#00F2FE',
    exampleUrl: 'https://tiktok.com/@user/video/...',
    supportedQualities: ['1080p HD', 'No Watermark', 'MP3'],
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    tagline: 'Watch & Reels',
    iconName: 'Facebook',
    badgeBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    badgeTextColor: 'text-blue-400',
    accentColor: '#1877F2',
    exampleUrl: 'https://facebook.com/watch/?v=...',
    supportedQualities: ['1080p', '720p', 'SD'],
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    tagline: 'Reels & Videos',
    iconName: 'Instagram',
    badgeBg: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
    badgeTextColor: 'text-pink-400',
    accentColor: '#E4405F',
    exampleUrl: 'https://instagram.com/reel/...',
    supportedQualities: ['1080p HD', '720p'],
  },
  unknown: {
    id: 'unknown',
    name: 'Web Link',
    tagline: 'Generic Video',
    iconName: 'Globe',
    badgeBg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
    badgeTextColor: 'text-slate-400',
    accentColor: '#94A3B8',
    exampleUrl: 'https://example.com/video.mp4',
    supportedQualities: ['Standard Stream'],
  },
};

export class PlatformDetectorService implements IPlatformDetector {
  public detect(normalizedUrl: string): PlatformType {
    const trimmed = normalizedUrl.trim().toLowerCase();

    if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
      return PlatformType.YOUTUBE;
    }
    if (trimmed.includes('tiktok.com') || trimmed.includes('vm.tiktok.com') || trimmed.includes('vt.tiktok.com')) {
      return PlatformType.TIKTOK;
    }
    if (trimmed.includes('facebook.com') || trimmed.includes('fb.watch') || trimmed.includes('fb.com')) {
      return PlatformType.FACEBOOK;
    }
    if (trimmed.includes('instagram.com') || trimmed.includes('instagr.am')) {
      return PlatformType.INSTAGRAM;
    }

    return PlatformType.UNKNOWN;
  }

  public detectPlatform(url: string): SupportedPlatform {
    const p = this.detect(url);
    switch (p) {
      case PlatformType.YOUTUBE:
        return 'youtube';
      case PlatformType.TIKTOK:
        return 'tiktok';
      case PlatformType.FACEBOOK:
        return 'facebook';
      case PlatformType.INSTAGRAM:
        return 'instagram';
      default:
        return 'unknown';
    }
  }

  public isValidUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed) return false;

    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}

export const platformDetectorService = new PlatformDetectorService();
