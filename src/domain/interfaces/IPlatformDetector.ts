import type { PlatformType } from '../models/PlatformType';

export interface IPlatformDetector {
  detect(normalizedUrl: string): PlatformType;
}
