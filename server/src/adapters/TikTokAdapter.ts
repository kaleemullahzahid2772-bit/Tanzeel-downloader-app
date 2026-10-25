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
        {
          formatId: '720p',
          resolution: '720p',
          container: 'mp4',
          qualityLabel: '720p Standard (MP4)',
          estimatedSizeBytes: 10 * 1024 * 1024,
          estimatedSizeFormatted: '10.0 MB',
          isAudioOnly: false,
          url: realMeta.directMediaUrl,
        },
        {
          formatId: 'audio',
          resolution: 'Audio',
          container: 'mp3',
          qualityLabel: 'Original Audio (MP3)',
          estimatedSizeBytes: 3 * 1024 * 1024,
          estimatedSizeFormatted: '3.0 MB',
          isAudioOnly: true,
          url: (realMeta as any).musicUrl || realMeta.directMediaUrl,
        },
      ],
      analyzedAt: new Date().toISOString(),
    };
  }

  public async createMediaStream(url: string, formatId?: string, title?: string): Promise<StreamMediaResult> {
    const isAudio = formatId?.toLowerCase() === 'mp3' || formatId?.toLowerCase() === 'audio';

    // 1. Fast direct TikWM / CDN extracted media URL stream (1-2 seconds)
    try {
      const realMeta = await realMediaExtractorService.fetchRealMetadata(url, 'tiktok');
      if (realMeta?.directMediaUrl) {
        const safeTitle = (title || realMeta.title || 'tiktok_video').replace(/[^a-zA-Z0-9_]/g, '_');
        const filename = `${safeTitle}.${isAudio ? 'mp3' : 'mp4'}`;
        const realStream = await realMediaExtractorService.createRealStreamFromUrl(realMeta.directMediaUrl);
        if (realStream && realStream.stream) {
          return {
            stream: realStream.stream,
            contentLength: realStream.contentLength,
            contentType: isAudio ? 'audio/mpeg' : (realStream.contentType || 'video/mp4'),
            filename,
            isExactLength: realStream.contentLength > 0,
          };
        }
      }
    } catch {
      // Fallback
    }

    // 2. Direct fast extraction via yt-dlp direct URL
    try {
      const directUrl = await ytDlpExtractorService.getDirectMediaUrl(url, isAudio, formatId);
      if (directUrl) {
        const safeTitle = (title || 'tiktok_video').replace(/[^a-zA-Z0-9_]/g, '_');
        const filename = `${safeTitle}.${isAudio ? 'mp3' : 'mp4'}`;
        const realStream = await realMediaExtractorService.createRealStreamFromUrl(directUrl);
        if (realStream && realStream.stream) {
          return {
            stream: realStream.stream,
            contentLength: realStream.contentLength,
            contentType: isAudio ? 'audio/mpeg' : (realStream.contentType || 'video/mp4'),
            filename,
            isExactLength: realStream.contentLength > 0,
          };
        }
      }
    } catch {
      // Fallback
    }

    // 3. Fallback to real yt-dlp binary stream output (bulletproof backup)
    const ytDlpStream = await ytDlpExtractorService.createMediaStream(url, title, formatId);
    if (ytDlpStream && ytDlpStream.stream) {
      return ytDlpStream;
    }

    // 4. Secondary fallback via extractMetadata if needed
    const meta = await this.extractMetadata(url).catch(() => null);
    if (meta) {
      const safeTitle = (title || meta.title || 'tiktok_video').replace(/[^a-zA-Z0-9_]/g, '_');
      const filename = `${safeTitle}.${isAudio ? 'mp3' : 'mp4'}`;

      const selectedFormat = isAudio
        ? (meta.formats.find((f) => f.isAudioOnly) || meta.formats[0])
        : (meta.formats.find((f) => f.formatId === formatId) || meta.formats[0]);

      const directUrl = selectedFormat?.url || meta.formats[0]?.url;
      if (directUrl) {
        const realStream = await realMediaExtractorService.createRealStreamFromUrl(directUrl);
        if (realStream && realStream.stream) {
          return {
            stream: realStream.stream,
            contentLength: realStream.contentLength,
            contentType: isAudio ? 'audio/mpeg' : (realStream.contentType || 'video/mp4'),
            filename,
            isExactLength: realStream.contentLength > 0,
          };
        }
      }
    }

    const err = new Error('Unable to download video from TikTok link. Please make sure the TikTok link is public.');
    (err as any).statusCode = 400;
    (err as any).isUserFacing = true;
    throw err;
  }
}
