import { IMediaExtractor } from '../domain/interfaces/IMediaExtractor';
import { IPlatformAdapter, StreamMediaResult } from '../domain/interfaces/IPlatformAdapter';
import { MediaMetadata } from '../domain/models/MediaMetadata';
import { YouTubeAdapter } from '../adapters/YouTubeAdapter';
import { TikTokAdapter } from '../adapters/TikTokAdapter';
import { FacebookAdapter } from '../adapters/FacebookAdapter';
import { InstagramAdapter } from '../adapters/InstagramAdapter';
import { GenericWebAdapter } from '../adapters/GenericWebAdapter';
import { ssrfProtectionService } from './security/SsrfProtectionService';

export class MediaExtractorService implements IMediaExtractor {
  private adapters: IPlatformAdapter[];

  constructor() {
    this.adapters = [
      new YouTubeAdapter(),
      new TikTokAdapter(),
      new FacebookAdapter(),
      new InstagramAdapter(),
      new GenericWebAdapter(), // Fallback for any generic web video URL
    ];
  }

  private validateAndFindAdapter(url: string): IPlatformAdapter {
    const ssrfCheck = ssrfProtectionService.validateUrl(url);
    if (!ssrfCheck.isSafe) {
      const err = new Error(ssrfCheck.errorMessage || 'The video link appears to be invalid.');
      (err as any).statusCode = 400;
      (err as any).isUserFacing = true;
      throw err;
    }

    const adapter = this.adapters.find((a) => a.canHandle(url));
    if (!adapter) {
      const err = new Error('This video platform is not supported yet.');
      (err as any).statusCode = 400;
      (err as any).isUserFacing = true;
      throw err;
    }
    return adapter;
  }

  public async analyzeUrl(url: string): Promise<MediaMetadata> {
    const adapter = this.validateAndFindAdapter(url);
    return adapter.extractMetadata(url);
  }

  public async downloadMedia(url: string, quality?: string): Promise<StreamMediaResult> {
    const adapter = this.validateAndFindAdapter(url);
    return adapter.createMediaStream(url, quality);
  }
}

export const mediaExtractorService = new MediaExtractorService();
