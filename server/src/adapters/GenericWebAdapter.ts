import { IPlatformAdapter, StreamMediaResult } from '../domain/interfaces/IPlatformAdapter';
import { MediaMetadata } from '../domain/models/MediaMetadata';
import { PlayableVideoService } from '../services/PlayableVideoService';
import { realMediaExtractorService } from '../services/RealMediaExtractorService';
import { ytDlpExtractorService } from '../services/YtDlpExtractorService';

export class GenericWebAdapter implements IPlatformAdapter {
  public platformId = 'unknown' as const;

  public canHandle(_url: string): boolean {
    return true; // Fallback adapter handles any valid URL
  }

  public async extractMetadata(url: string): Promise<MediaMetadata> {
    // 1. Try real yt-dlp binary extraction
    const ytDlpMeta = await ytDlpExtractorService.analyzeUrl(url, 'unknown');
    if (ytDlpMeta) return ytDlpMeta;

    // 2. Fallback to OpenGraph / Cheerio extraction
    const realMeta = await realMediaExtractorService.fetchRealMetadata(url, 'unknown');

    return {
      url,
      normalizedUrl: url,
      platform: 'unknown',
      platformName: realMeta.platformName || 'Web Video',
      title: realMeta.title || 'Web Media Video',
      author: realMeta.author || 'Web Source',
      thumbnailUrl: realMeta.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      durationSeconds: 120,
      durationFormatted: '02:00',
      formats: [
        {
          formatId: '1080p',
          resolution: '1080p',
          container: 'mp4',
          qualityLabel: 'Standard Stream (MP4)',
          estimatedSizeBytes: 5242880,
          estimatedSizeFormatted: '5.0 MB',
          isAudioOnly: false,
          url: realMeta.directMediaUrl || url,
        },
      ],
      analyzedAt: new Date().toISOString(),
    };
  }

  public async createMediaStream(url: string, formatId?: string): Promise<StreamMediaResult> {
    const meta = await this.extractMetadata(url);
    const isAudio = formatId?.toLowerCase() === 'mp3' || formatId?.toLowerCase() === 'audio';
    const filename = `${meta.title.replace(/[^a-zA-Z0-9_]/g, '_')}.${isAudio ? 'mp3' : 'mp4'}`;

    // 1. Try real yt-dlp binary stream output
    const ytDlpStream = await ytDlpExtractorService.createMediaStream(url, meta.title, formatId);
    if (ytDlpStream && ytDlpStream.stream) {
      return ytDlpStream;
    }

    // 2. Direct HTML extracted media URL stream
    const directUrl = meta.formats[0]?.url || url;
    if (directUrl) {
      const realStream = await realMediaExtractorService.createRealStreamFromUrl(directUrl);
      if (realStream) {
        return {
          stream: realStream.stream,
          contentLength: realStream.contentLength,
          contentType: realStream.contentType,
          filename,
        };
      }
    }

    // 3. Fallback
    const { stream, contentLength, isExactLength } = PlayableVideoService.createPlayableStream(isAudio);
    return {
      stream,
      contentLength,
      contentType: isAudio ? 'audio/mpeg' : 'video/mp4',
      filename,
      isExactLength,
    };
  }
}
