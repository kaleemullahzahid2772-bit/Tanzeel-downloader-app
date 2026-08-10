import type { MediaMetadata } from '../models/MediaMetadata';

export interface IBackendApiClient {
  checkHealth(): Promise<boolean>;
  analyzeUrl(url: string): Promise<MediaMetadata>;
  analyzeVideo?(url: string): Promise<MediaMetadata>;
  downloadMedia(
    url: string,
    qualityOrCb?: string | ((loadedBytes: number, totalBytes: number, percent: number) => void),
    onProgress?: (receivedBytes: number, totalBytes: number) => void
  ): Promise<Blob>;
  downloadMediaStream?(
    url: string,
    qualityOrCb?: string | ((loadedBytes: number, totalBytes: number, percent: number) => void),
    onProgress?: (loadedBytes: number, totalBytes: number, percent: number) => void
  ): Promise<Blob>;
}
