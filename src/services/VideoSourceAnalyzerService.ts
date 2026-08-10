import type { IVideoSourceAnalyzer } from '../domain/interfaces/IVideoSourceAnalyzer';
import type { PlatformAnalysisResult } from '../domain/models/PlatformAnalysisResult';
import { PlatformType, PLATFORM_DISPLAY_NAMES } from '../domain/models/PlatformType';
import { urlValidator } from './url/UrlValidator';
import { urlNormalizer } from './url/UrlNormalizer';
import { platformDetector } from './platform/PlatformDetector';
import { videoIdExtractor } from './platform/VideoIdExtractor';

export class VideoSourceAnalyzerService implements IVideoSourceAnalyzer {
  public async analyze(rawUrl: string): Promise<PlatformAnalysisResult> {
    // 1. Validation
    const validation = urlValidator.validate(rawUrl);
    if (!validation.isValid) {
      return {
        originalUrl: rawUrl || '',
        normalizedUrl: '',
        platform: PlatformType.UNKNOWN,
        platformName: PLATFORM_DISPLAY_NAMES[PlatformType.UNKNOWN],
        videoId: null,
        isRecognized: false,
        isValid: false,
        errorMessage: validation.errorMessage,
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Normalization
    const normalizedUrl = urlNormalizer.normalize(rawUrl);

    // 3. Platform Detection
    const platform = platformDetector.detect(normalizedUrl);
    const platformName = PLATFORM_DISPLAY_NAMES[platform];
    const isRecognized = platform !== PlatformType.UNKNOWN;

    // 4. Video ID Extraction
    const videoId = videoIdExtractor.extractVideoId(normalizedUrl, platform);

    // If platform is UNKNOWN, specify error message
    let errorMessage: string | null = null;
    if (platform === PlatformType.UNKNOWN) {
      errorMessage = 'This video platform is not supported yet.';
    }

    return {
      originalUrl: rawUrl,
      normalizedUrl,
      platform,
      platformName,
      videoId,
      isRecognized,
      isValid: true,
      errorMessage,
      timestamp: new Date().toISOString(),
    };
  }
}

export const videoSourceAnalyzerService = new VideoSourceAnalyzerService();
