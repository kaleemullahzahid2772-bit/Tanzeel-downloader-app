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

  public async createMediaStream(url: string, formatId?: string): Promise<StreamMediaResult> {
    const meta = await this.extractMetadata(url);

    // 1. Try real yt-dlp binary stream output with exact quality requested
    const ytDlpStream = await ytDlpExtractorService.createMediaStream(url, meta.title, formatId);
    if (ytDlpStream && ytDlpStream.stream) {
      return ytDlpStream;
    }

    throw new Error('Unable to download YouTube video. Please verify the link is public.');
  }
}
