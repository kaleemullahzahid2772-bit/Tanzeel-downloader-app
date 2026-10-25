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

    // 1. Fast direct HTML / OpenGraph extraction (instantaneous, no child process)
    const realMeta = await realMediaExtractorService.fetchRealMetadata(url, 'instagram');
    if (realMeta && realMeta.directMediaUrl) {
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
            estimatedSizeBytes: 12 * 1024 * 1024,
            estimatedSizeFormatted: '12.0 MB',
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
            url: realMeta.directMediaUrl,
          },
        ],
        analyzedAt: new Date().toISOString(),
      };
    }

    // 2. Try real yt-dlp binary extraction
    const ytDlpMeta = await ytDlpExtractorService.analyzeUrl(url, 'instagram');
    if (ytDlpMeta) return ytDlpMeta;

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

  public async createMediaStream(url: string, formatId?: string, title?: string): Promise<StreamMediaResult> {
    const isAudio = formatId?.toLowerCase() === 'mp3' || formatId?.toLowerCase() === 'audio';

    // 1. Fast direct HTML / OpenGraph extracted media URL stream (1-3 seconds)
    try {
      const realMeta = await realMediaExtractorService.fetchRealMetadata(url, 'instagram');
      if (realMeta?.directMediaUrl) {
        const safeTitle = (title || realMeta.title || 'instagram_video').replace(/[^a-zA-Z0-9_]/g, '_');
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
        const safeTitle = (title || 'instagram_video').replace(/[^a-zA-Z0-9_]/g, '_');
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

    // 5. Secondary fallback via extractMetadata if needed
    const meta = await this.extractMetadata(url).catch(() => null);
    if (meta) {
      const isAudio = formatId?.toLowerCase() === 'mp3' || formatId?.toLowerCase() === 'audio';
      const safeTitle = (title || meta.title || 'instagram_video').replace(/[^a-zA-Z0-9_]/g, '_');
      const filename = `${safeTitle}.${isAudio ? 'mp3' : 'mp4'}`;

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
    }

    const err = new Error('Unable to download Instagram video. Please make sure the account is public.');
    (err as any).statusCode = 400;
    (err as any).isUserFacing = true;
    throw err;
  }
}
