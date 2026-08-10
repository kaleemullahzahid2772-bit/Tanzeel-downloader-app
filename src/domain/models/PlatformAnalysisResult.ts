import type { PlatformType } from './PlatformType';

export interface PlatformAnalysisResult {
  originalUrl: string;
  normalizedUrl: string;
  platform: PlatformType;
  platformName: string;
  videoId: string | null;
  isRecognized: boolean;
  isValid: boolean;
  errorMessage: string | null;
  timestamp: string;
}
