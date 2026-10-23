import { IPlatformAdapter, StreamMediaResult } from '../domain/interfaces/IPlatformAdapter';
import { MediaMetadata } from '../domain/models/MediaMetadata';
import { realMediaExtractorService } from '../services/RealMediaExtractorService';
import { ytDlpExtractorService } from '../services/YtDlpExtractorService';

export class InstagramAdapter implements IPlatformAdapter {
  public platformId = 'instagram' as const;

  public canHandle(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.includes('instagram.com') || lower.includes('instagr.am');
  }

  public async extractMetadata(url: string): Promise<MediaMetadata> {
    if (!this.canHandle(url)) {
      throw new Error('URL is not a valid Instagram video link.');
    }

    // 1. Try real yt-dlp binary extraction
    const ytDlpMeta = await ytDlpExtractorService.analyzeUrl(url, 'instagram');
    if (ytDlpMeta) return ytDlpMeta;

    // 2. Fallback to OpenGraph / Cheerio extraction
    const realMeta = await realMediaExtractorService.fetchRealMetadata(url, 'instagram');

    return {
      url,
      normalizedUrl: url,
      platform: 'instagram',
      platformName: 'Instagram',
      title: realMeta.title || 'Instagram Reel',
      author: realMeta.author || '@instagrammer',
      thumbnailUrl: realMeta.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&auto=format&fit=crop&q=80',
      durationSeconds: 30,
      durationFormatted: '00:30',
      formats: [
        {
          formatId: '720p',
          resolution: '720p',
          container: 'mp4',
          qualityLabel: '720p HD (MP4)',
          estimatedSizeBytes: 8388608,
          estimatedSizeFormatted: '8.0 MB',
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

    // 1. Try real yt-dlp binary stream output
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

    throw new Error('Unable to download Instagram video. Please make sure the account is public.');
  }
}
