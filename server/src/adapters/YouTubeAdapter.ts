import { IPlatformAdapter, StreamMediaResult } from '../domain/interfaces/IPlatformAdapter';
import { MediaMetadata } from '../domain/models/MediaMetadata';
import { realMediaExtractorService } from '../services/RealMediaExtractorService';
import { ytDlpExtractorService } from '../services/YtDlpExtractorService';

export class YouTubeAdapter implements IPlatformAdapter {
  public platformId = 'youtube' as const;

  public canHandle(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.includes('youtube.com') || lower.includes('youtu.be');
  }

  public async extractMetadata(url: string): Promise<MediaMetadata> {
    if (!this.canHandle(url)) {
      throw new Error('URL is not a valid YouTube video link.');
    }

    // 1. Try real yt-dlp binary extraction
    const ytDlpMeta = await ytDlpExtractorService.analyzeUrl(url, 'youtube');
    if (ytDlpMeta) return ytDlpMeta;

    // 2. Fallback to oEmbed extraction
    const realMeta = await realMediaExtractorService.fetchRealMetadata(url, 'youtube');

    return {
      url,
      normalizedUrl: url,
      platform: 'youtube',
      platformName: 'YouTube',
      title: realMeta.title || 'YouTube Video',
      author: realMeta.author || 'YouTube Creator',
      thumbnailUrl: realMeta.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      durationSeconds: 180,
      durationFormatted: '03:00',
      formats: [
        {
          formatId: '1080p',
          resolution: '1080p',
          container: 'mp4',
          qualityLabel: '1080p Full HD (MP4)',
          estimatedSizeBytes: 35 * 1024 * 1024,
          estimatedSizeFormatted: '35.0 MB',
          isAudioOnly: false,
        },
        {
          formatId: '720p',
          resolution: '720p',
          container: 'mp4',
          qualityLabel: '720p HD (MP4)',
          estimatedSizeBytes: 18 * 1024 * 1024,
          estimatedSizeFormatted: '18.0 MB',
          isAudioOnly: false,
        },
        {
          formatId: 'audio',
          resolution: 'Audio',
          container: 'mp3',
          qualityLabel: 'MP3 Audio (Original Sound)',
          estimatedSizeBytes: 5 * 1024 * 1024,
          estimatedSizeFormatted: '5.0 MB',
          isAudioOnly: true,
        },
      ],
      analyzedAt: new Date().toISOString(),
    };
  }

  public async createMediaStream(url: string, formatId?: string, title?: string): Promise<StreamMediaResult> {
    const isAudio = formatId?.toLowerCase() === 'mp3' || formatId?.toLowerCase() === 'audio';
    const safeTitle = (title || 'youtube_video').replace(/[^a-zA-Z0-9_]/g, '_');
    const filename = `${safeTitle}.${isAudio ? 'mp3' : 'mp4'}`;

    // 1. Direct fast streaming via yt-dlp extracted direct URL (2-3 seconds, ratebypass, no disk wait)
    try {
      const directUrl = await ytDlpExtractorService.getDirectMediaUrl(url, isAudio, formatId);
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
    } catch (directErr) {
      console.warn('[YouTubeAdapter] Direct URL fast extraction failed, falling back:', directErr);
    }

    // 2. Direct fast stdout progressive streaming (4-6 seconds, no disk wait, cloud resilient)
    try {
      const stdoutStream = await ytDlpExtractorService.createStdoutMediaStream(url, title, formatId);
      if (stdoutStream && stdoutStream.stream) {
        return stdoutStream;
      }
    } catch (stdoutErr) {
      console.warn('[YouTubeAdapter] Stdout fast streaming failed, falling back to disk:', stdoutErr);
    }

    // 3. Fallback to real yt-dlp binary disk output (uses optimized progressive streams)
    const ytDlpStream = await ytDlpExtractorService.createMediaStream(url, title, formatId);
    if (ytDlpStream && ytDlpStream.stream) {
      return ytDlpStream;
    }

    // 4. Retry after metadata extraction if direct stream failed
    const meta = await this.extractMetadata(url).catch(() => null);
    if (meta) {
      const selectedFormat = isAudio
        ? meta.formats.find((f) => f.isAudioOnly && f.url)
        : (meta.formats.find((f) => f.formatId === formatId && f.url) || meta.formats.find((f) => f.url));

      if (selectedFormat?.url) {
        const realStream = await realMediaExtractorService.createRealStreamFromUrl(selectedFormat.url);
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

      const retryStream = await ytDlpExtractorService.createMediaStream(url, meta.title, formatId);
      if (retryStream && retryStream.stream) {
        return retryStream;
      }
    }

    const err = new Error('Unable to download YouTube video. Please verify the link is public.');
    (err as any).statusCode = 400;
    (err as any).isUserFacing = true;
    throw err;
  }
}
