export const PlatformType = {
  YOUTUBE: 'YOUTUBE',
  TIKTOK: 'TIKTOK',
  FACEBOOK: 'FACEBOOK',
  INSTAGRAM: 'INSTAGRAM',
  UNKNOWN: 'UNKNOWN',
} as const;

export type PlatformType = typeof PlatformType[keyof typeof PlatformType];

export const PLATFORM_DISPLAY_NAMES: Record<PlatformType, string> = {
  [PlatformType.YOUTUBE]: 'YouTube',
  [PlatformType.TIKTOK]: 'TikTok',
  [PlatformType.FACEBOOK]: 'Facebook',
  [PlatformType.INSTAGRAM]: 'Instagram',
  [PlatformType.UNKNOWN]: 'Unknown',
};
