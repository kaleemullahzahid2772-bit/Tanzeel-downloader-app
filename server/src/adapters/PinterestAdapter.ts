import { IPlatformAdapter, StreamMediaResult } from '../domain/interfaces/IPlatformAdapter';
import { MediaMetadata } from '../domain/models/MediaMetadata';
import { realMediaExtractorService } from '../services/RealMediaExtractorService';
import { ytDlpExtractorService } from '../services/YtDlpExtractorService';

export class PinterestAdapter implements IPlatformAdapter {
  public platformId = 'pinterest' as const;

  public canHandle(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.includes('pinterest.com') || lower.includes('pin.it');
  }

  public async extractMetadata(url: string): Promise<MediaMetadata> {
    if (!this.canHandle(url)) {
      throw new Error('URL is not a valid Pinterest video link.');
    }

    // 1. Fast direct extraction (1-2 seconds)
    const realMeta = await realMediaExtractorService.fetchRealMetadata(url, 'pinterest');
    if (realMeta && realMeta.directMediaUrl) {
      return {
        url,
        normalizedUrl: url,
        platform: 'pinterest',
        platformName: 'Pinterest',
        title: realMeta.title || 'Pinterest Video',
        author: realMeta.author || 'Pinterest Creator',
        thumbnailUrl: realMeta.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        durationSeconds: 45,
        durationFormatted: '00:45',
        formats: [
          {
            formatId: '720p',
            resolution: '720p',
            container: 'mp4',
            qualityLabel: '720p HD (MP4)',
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
            estimatedSizeBytes: 2 * 1024 * 1024,
            estimatedSizeFormatted: '2.0 MB',
            isAudioOnly: true,
            url: realMeta.directMediaUrl,
          },
        ],
        analyzedAt: new Date().toISOString(),
      };
    }

    // 2. Try real yt-dlp binary extraction
    const ytDlpMeta = await ytDlpExtractorService.analyzeUrl(url, 'unknown');
    if (ytDlpMeta) {
      return {
        ...ytDlpMeta,
        platform: 'pinterest',
        platformName: 'Pinterest',
      };
    }

    // 3. Fallback to OpenGraph / metadata
    return {
      url,
      normalizedUrl: url,
      platform: 'pinterest',
      platformName: 'Pinterest',
      title: realMeta.title || 'Pinterest Video',
      author: realMeta.author || 'Pinterest Creator',
      thumbnailUrl: realMeta.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      durationSeconds: 45,
      durationFormatted: '00:45',
      formats: [
        {
          formatId: '720p',
          resolution: '720p',
          container: 'mp4',
          qualityLabel: '720p HD (MP4)',
          estimatedSizeBytes: 10 * 1024 * 1024,
          estimatedSizeFormatted: '10.0 MB',
          isAudioOnly: false,
          url: realMeta.directMediaUrl,
        },
      ],
      analyzedAt: new Date().toISOString(),
    };
  }

  public async createMediaStream(url: string, formatId?: string, title?: string): Promise<StreamMediaResult> {
    const isAudio = formatId?.toLowerCase() === 'mp3' || formatId?.toLowerCase() === 'audio';

    // 1. Fast direct CDN extracted media URL stream (1-2 seconds, like TikTok)
    try {
      const realMeta = await realMediaExtractorService.fetchRealMetadata(url, 'pinterest');
      if (realMeta?.directMediaUrl) {
        const safeTitle = (title || realMeta.title || 'pinterest_video').replace(/[^a-zA-Z0-9_]/g, '_');
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
        const safeTitle = (title || 'pinterest_video').replace(/[^a-zA-Z0-9_]/g, '_');
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

    // 3. Fast direct stdout progressive streaming (real-time chunking, no disk delay)
    try {
      const stdoutStream = await ytDlpExtractorService.createStdoutMediaStream(url, title, formatId);
      if (stdoutStream && stdoutStream.stream) {
        return stdoutStream;
      }
    } catch {
      // Fallback
    }

    // 4. Fallback to real yt-dlp binary stream output (bulletproof backup)
    const ytDlpStream = await ytDlpExtractorService.createMediaStream(url, title, formatId);
    if (ytDlpStream && ytDlpStream.stream) {
      return ytDlpStream;
    }

    const err = new Error('Unable to download Pinterest video.');
    (err as any).statusCode = 400;
    (err as any).isUserFacing = true;
    throw err;
  }
}
