import { IPlatformAdapter, StreamMediaResult } from '../domain/interfaces/IPlatformAdapter';
import { MediaMetadata } from '../domain/models/MediaMetadata';
import { realMediaExtractorService } from '../services/RealMediaExtractorService';
import { ytDlpExtractorService } from '../services/YtDlpExtractorService';

export class GenericWebAdapter implements IPlatformAdapter {
  public platformId = 'unknown' as const;

  public canHandle(url: string): boolean {
    return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));
  }

  public async extractMetadata(url: string): Promise<MediaMetadata> {
    // 1. Try yt-dlp first
    const ytDlpMeta = await ytDlpExtractorService.analyzeUrl(url, 'unknown');
    if (ytDlpMeta) return ytDlpMeta;

    // 2. Fallback to OpenGraph / Cheerio / Direct Media Link
    const realMeta = await realMediaExtractorService.fetchRealMetadata(url, 'unknown');

    let hostname = 'Web Video';
    try {
      hostname = new URL(url).hostname;
    } catch {
      // Ignore
    }

    return {
      url,
      normalizedUrl: url,
      platform: 'unknown',
      platformName: hostname,
      title: realMeta.title || 'Online Video',
      author: realMeta.author || 'Web Publisher',
      thumbnailUrl: realMeta.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      durationSeconds: 120,
      durationFormatted: '02:00',
      formats: [
        {
          formatId: '720p',
          resolution: '720p',
          container: 'mp4',
          qualityLabel: '720p Standard (MP4)',
          estimatedSizeBytes: 10485760,
          estimatedSizeFormatted: '10.0 MB',
          isAudioOnly: false,
          url: realMeta.directMediaUrl,
        },
      ],
      analyzedAt: new Date().toISOString(),
    };
  }

  public async createMediaStream(url: string, formatId?: string, title?: string): Promise<StreamMediaResult> {
    // 1. Try real yt-dlp binary stream output directly (fast)
    const ytDlpStream = await ytDlpExtractorService.createMediaStream(url, title, formatId);
    if (ytDlpStream && ytDlpStream.stream) {
      return ytDlpStream;
    }

    // 2. Direct HTML extracted media URL stream
    const meta = await this.extractMetadata(url).catch(() => null);
    const isAudio = formatId?.toLowerCase() === 'mp3' || formatId?.toLowerCase() === 'audio';
    const safeTitle = (title || meta?.title || 'web_video').replace(/[^a-zA-Z0-9_]/g, '_');
    const filename = `${safeTitle}.${isAudio ? 'mp3' : 'mp4'}`;

    const directUrl = meta?.formats[0]?.url || url;
    if (directUrl && (directUrl.endsWith('.mp4') || directUrl.endsWith('.webm') || directUrl.includes('googlevideo.com') || directUrl.includes('fbcdn.net') || directUrl.includes('cdninstagram.com'))) {
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

    const err = new Error('Unable to extract playable video stream from this URL.');
    (err as any).statusCode = 400;
    (err as any).isUserFacing = true;
    throw err;
  }
}
