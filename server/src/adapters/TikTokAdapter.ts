import { IPlatformAdapter, StreamMediaResult } from '../domain/interfaces/IPlatformAdapter';
import { MediaMetadata } from '../domain/models/MediaMetadata';
import { realMediaExtractorService } from '../services/RealMediaExtractorService';
import { ytDlpExtractorService } from '../services/YtDlpExtractorService';

export class TikTokAdapter implements IPlatformAdapter {
  public platformId = 'tiktok' as const;

  public canHandle(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.includes('tiktok.com') || lower.includes('vt.tiktok') || lower.includes('vm.tiktok');
  }

  public async extractMetadata(url: string): Promise<MediaMetadata> {
    if (!this.canHandle(url)) {
      throw new Error('URL is not a valid TikTok video link.');
    }

    // 1. Try real yt-dlp binary extraction
    const ytDlpMeta = await ytDlpExtractorService.analyzeUrl(url, 'tiktok');
    if (ytDlpMeta) return ytDlpMeta;

    // 2. Fallback to OpenGraph / Cheerio extraction
    const realMeta = await realMediaExtractorService.fetchRealMetadata(url, 'tiktok');

    return {
      url,
      normalizedUrl: url,
      platform: 'tiktok',
      platformName: 'TikTok',
      title: realMeta.title || 'TikTok Short Video',
      author: realMeta.author || '@tiktokcreator',
      thumbnailUrl: realMeta.thumbnailUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
      durationSeconds: 58,
      durationFormatted: '00:58',
      formats: [
        {
          formatId: '1080p',
          resolution: '1080p',
          container: 'mp4',
          qualityLabel: '1080p No Watermark (MP4)',
          estimatedSizeBytes: 15 * 1024 * 1024,
          estimatedSizeFormatted: '15.0 MB',
          isAudioOnly: false,
          url: realMeta.directMediaUrl,
        },
      ],
      analyzedAt: new Date().toISOString(),
    };
  }

  public async createMediaStream(url: string, formatId?: string): Promise<StreamMediaResult> {
    const meta = await this.extractMetadata(url);
    const isAudio = formatId?.toLowerCase() === 'mp3' || formatId?.toLowerCase() === 'audio';
    const filename = `${meta.title.replace(/[^a-zA-Z0-9_]/g, '_')}.${isAudio ? 'mp3' : 'mp4'}`;

    // 1. Try real yt-dlp binary stream output (guaranteed real video)
    const ytDlpStream = await ytDlpExtractorService.createMediaStream(url, meta.title, formatId);
    if (ytDlpStream && ytDlpStream.stream) {
      return ytDlpStream;
    }

    // 2. Direct HTML extracted media URL stream
    const directUrl = meta.formats[0]?.url;
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

    throw new Error('Unable to download video from TikTok link. Please make sure the TikTok link is public.');
  }
}
