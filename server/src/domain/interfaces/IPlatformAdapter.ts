import { MediaMetadata } from '../models/MediaMetadata';
import { Readable } from 'stream';

export interface StreamMediaResult {
  stream: Readable;
  contentLength: number;
  contentType: string;
  filename: string;
  isExactLength?: boolean;
}

export interface IPlatformAdapter {
  platformId: 'youtube' | 'tiktok' | 'facebook' | 'instagram' | 'pinterest' | 'unknown';
  canHandle(url: string): boolean;
  extractMetadata(url: string): Promise<MediaMetadata>;
  createMediaStream(url: string, formatId?: string, title?: string): Promise<StreamMediaResult>;
}
