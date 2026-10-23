import { MediaMetadata } from '../models/MediaMetadata';
import { StreamMediaResult } from './IPlatformAdapter';

export interface IMediaExtractor {
  analyzeUrl(url: string): Promise<MediaMetadata>;
  downloadMedia(url: string, quality?: string, title?: string): Promise<StreamMediaResult>;
}
