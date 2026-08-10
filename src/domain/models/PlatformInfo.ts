import type { SupportedPlatform } from './VideoItem';

export interface PlatformDetails {
  id: SupportedPlatform;
  name: string;
  tagline: string;
  iconName: string;
  badgeBg: string;
  badgeTextColor: string;
  accentColor: string;
  exampleUrl: string;
  supportedQualities: string[];
}
