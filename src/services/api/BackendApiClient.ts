import type { IBackendApiClient } from '../../domain/interfaces/IBackendApiClient';
import type { MediaMetadata } from '../../domain/models/MediaMetadata';
import type { SupportedPlatform } from '../../domain/models/VideoItem';
import { envConfig } from '../../config/env.config';

export class BackendApiClient implements IBackendApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || envConfig.apiUrl;
  }

  public async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`);
      if (!res.ok) return false;
      const data = await res.json();
      return data.status === 'ok';
    } catch {
      return false;
    }
  }

  public async analyzeUrl(url: string): Promise<MediaMetadata> {
    const res = await fetch(`${this.baseUrl}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      let errorMsg = 'Unable to analyze video link.';
      try {
        const errorData = await res.json();
        if (errorData.message || errorData.error) {
          errorMsg = errorData.message || errorData.error;
        }
      } catch {
        // Fallback message
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    // Safely handle response whether data is wrapped in data.data or directly at root level
    const meta = (data && data.data) ? data.data : (data || {});
    const rawPlatform = meta && meta.platform ? String(meta.platform).toLowerCase() : 'unknown';

    return {
      originalUrl: meta.originalUrl || url,
      normalizedUrl: meta.normalizedUrl || url,
      platform: rawPlatform as SupportedPlatform,
      title: meta.title || 'Video Download',
      thumbnailUrl: meta.thumbnailUrl || '',
      durationSeconds: meta.durationSeconds || 0,
      author: meta.author || '',
      formats: Array.isArray(meta.formats) ? meta.formats : [],
    };
  }

  public async analyzeVideo(url: string): Promise<MediaMetadata> {
    return this.analyzeUrl(url);
  }

  public async downloadMedia(
    url: string,
    qualityOrCb?: string | ((loadedBytes: number, totalBytes: number, percent: number) => void),
    onProgressCb?: (receivedBytes: number, totalBytes: number) => void
  ): Promise<Blob> {
    let quality = '1080p';
    let onProgress = onProgressCb;

    if (typeof qualityOrCb === 'function') {
      onProgress = (loaded, total) => {
        const pct = total > 0 ? Math.floor((loaded / total) * 100) : 0;
        qualityOrCb(loaded, total, pct);
      };
    } else if (typeof qualityOrCb === 'string') {
      quality = qualityOrCb;
    }

    const res = await fetch(`${this.baseUrl}/api/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, quality }),
    });

    if (!res.ok) {
      let errorMsg = 'Unable to download video stream.';
      try {
        const errorData = await res.json();
        if (errorData.message || errorData.error) {
          errorMsg = errorData.message || errorData.error;
        }
      } catch {
        // Fallback message
      }
      throw new Error(errorMsg);
    }

    const contentLengthHeader = res.headers.get('Content-Length');
    const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;

    if (!res.body) {
      return await res.blob();
    }

    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        chunks.push(value);
        receivedBytes += value.length;
        if (onProgress) {
          onProgress(receivedBytes, totalBytes);
        }
      }
    }

    return new Blob(chunks as BlobPart[], {
      type: res.headers.get('Content-Type') || 'video/mp4',
    });
  }

  public async downloadMediaStream(
    url: string,
    qualityOrCb?: string | ((loadedBytes: number, totalBytes: number, percent: number) => void),
    onProgressCb?: (loadedBytes: number, totalBytes: number, percent: number) => void
  ): Promise<Blob> {
    if (typeof qualityOrCb === 'function') {
      return this.downloadMedia(url, qualityOrCb);
    }
    return this.downloadMedia(url, qualityOrCb, (loaded, total) => {
      if (onProgressCb) {
        const pct = total > 0 ? Math.floor((loaded / total) * 100) : 0;
        onProgressCb(loaded, total, pct);
      }
    });
  }
}

export const backendApiClient = new BackendApiClient();
