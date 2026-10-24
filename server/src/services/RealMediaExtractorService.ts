import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';
import http from 'http';
import { URL } from 'url';
import { Readable } from 'stream';

export interface ExtractedRealMedia {
  title: string;
  author: string;
  thumbnailUrl: string;
  directMediaUrl?: string;
  platformName: string;
}

export class RealMediaExtractorService {
  public async fetchRealMetadata(rawUrl: string, platform: string): Promise<ExtractedRealMedia> {
    const trimmed = rawUrl.trim();

    // Direct MP4 / Web Video Check
    const lowerUrl = trimmed.toLowerCase();
    if (lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.webm') || lowerUrl.endsWith('.mov')) {
      let filename = 'Direct Video';
      try {
        const u = new URL(trimmed);
        filename = u.pathname.split('/').pop() || 'Direct Video';
      } catch {
        // Ignore
      }
      return {
        title: filename,
        author: 'Direct Video Stream',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        directMediaUrl: trimmed,
        platformName: 'Direct Media',
      };
    }

    // 1. YouTube oEmbed Real Extraction
    if (platform === 'youtube' || trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
      try {
        const res = await axios.get(`https://www.youtube.com/oembed?url=${encodeURIComponent(trimmed)}&format=json`, { timeout: 3000 });
        if (res.data && res.data.title) {
          return {
            title: res.data.title,
            author: res.data.author_name || 'YouTube Creator',
            thumbnailUrl: res.data.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
            platformName: 'YouTube',
          };
        }
      } catch {
        // Fallback
      }

      let videoId = 'video';
      if (trimmed.includes('v=')) {
        videoId = trimmed.split('v=')[1]?.split('&')[0] || videoId;
      }
      return {
        title: `YouTube Video (${videoId})`,
        author: 'YouTube Creator',
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        platformName: 'YouTube',
      };
    }

    // 2. TikTok Extraction (TikWM No-Watermark H.264 API + oEmbed Fallback)
    if (platform === 'tiktok' || trimmed.includes('tiktok.com') || trimmed.includes('vt.tiktok') || trimmed.includes('vm.tiktok')) {
      // 2a. Try TikWM API (H.264 MP4, no watermark, universal compatibility)
      try {
        const tikwmRes = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(trimmed)}&hd=1`, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'application/json',
          },
        }).catch(() => null);

        if (tikwmRes?.data && tikwmRes.data.code === 0 && tikwmRes.data.data) {
          const d = tikwmRes.data.data;
          let videoUrl = d.play || d.hdplay || d.wmplay;
          if (videoUrl && videoUrl.startsWith('/')) {
            videoUrl = `https://www.tikwm.com${videoUrl}`;
          }
          let musicUrl = d.music;
          if (musicUrl && musicUrl.startsWith('/')) {
            musicUrl = `https://www.tikwm.com${musicUrl}`;
          }

          return {
            title: d.title || 'TikTok Short Video',
            author: d.author?.nickname ? `@${d.author.unique_id || d.author.nickname}` : '@tiktokcreator',
            thumbnailUrl: d.cover || d.origin_cover || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
            directMediaUrl: videoUrl,
            platformName: 'TikTok',
          };
        }
      } catch {
        // Fallback to oembed / HTML
      }

      try {
        const oembedRes = await axios.get(`https://www.tiktok.com/oembed?url=${encodeURIComponent(trimmed)}`, { timeout: 3000 }).catch(() => null);
        const htmlOg = await this.extractOgAndDirectMedia(trimmed);

        return {
          title: oembedRes?.data?.title || htmlOg.title || 'TikTok Short Video',
          author: oembedRes?.data?.author_name || htmlOg.author || '@tiktokcreator',
          thumbnailUrl: oembedRes?.data?.thumbnail_url || htmlOg.thumbnailUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
          directMediaUrl: htmlOg.directMediaUrl,
          platformName: 'TikTok',
        };
      } catch {
        // Fallback
      }

      return {
        title: 'TikTok Short Video',
        author: '@tiktokcreator',
        thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
        platformName: 'TikTok',
      };
    }

    // 3. Facebook, Instagram & Web Video Extraction via Cheerio & Regex
    try {
      const extracted = await this.extractOgAndDirectMedia(trimmed);
      let platformName = platform.toUpperCase();
      if (trimmed.includes('facebook.com') || trimmed.includes('fb.watch')) platformName = 'Facebook';
      if (trimmed.includes('instagram.com') || trimmed.includes('instagr.am')) platformName = 'Instagram';

      if (extracted.title || extracted.directMediaUrl) {
        return {
          title: extracted.title || `${platformName} Video`,
          author: extracted.author || `${platformName} Page`,
          thumbnailUrl: extracted.thumbnailUrl || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
          directMediaUrl: extracted.directMediaUrl,
          platformName,
        };
      }
    } catch {
      // Fallback
    }

    if (platform === 'facebook' || trimmed.includes('facebook.com') || trimmed.includes('fb.watch')) {
      return {
        title: 'Facebook Watch Video',
        author: 'Facebook Page',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
        platformName: 'Facebook',
      };
    }

    if (platform === 'instagram' || trimmed.includes('instagram.com') || trimmed.includes('instagr.am')) {
      return {
        title: 'Instagram Reel',
        author: '@instagramuser',
        thumbnailUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&auto=format&fit=crop&q=80',
        platformName: 'Instagram',
      };
    }

    let fallbackDomain = 'Web Video';
    try {
      fallbackDomain = new URL(trimmed).hostname.replace('www.', '');
    } catch {
      // Ignore
    }

    return {
      title: `Media Video (${fallbackDomain})`,
      author: 'Media Creator',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      platformName: fallbackDomain,
    };
  }

  public async extractOgAndDirectMedia(urlStr: string): Promise<{ title?: string; author?: string; thumbnailUrl?: string; directMediaUrl?: string }> {
    try {
      const response = await axios.get(urlStr, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 3000,
        maxRedirects: 5,
      });

      const html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      const $ = cheerio.load(html);

      const title = $('meta[property="og:title"]').attr('content') ||
                    $('title').text() ||
                    $('meta[name="twitter:title"]').attr('content');

      const thumbnailUrl = $('meta[property="og:image"]').attr('content') ||
                           $('meta[name="twitter:image"]').attr('content');

      const author = $('meta[property="og:site_name"]').attr('content') ||
                     $('meta[name="author"]').attr('content');

      // Comprehensive Facebook/TikTok/Instagram/Web Video RegEx Extraction
      const directVideoMatch =
        $('meta[property="og:video:secure_url"]').attr('content') ||
        $('meta[property="og:video"]').attr('content') ||
        $('meta[name="twitter:player:stream"]').attr('content') ||
        html.match(/hd_src:"([^"]+)"/i)?.[1] ||
        html.match(/sd_src:"([^"]+)"/i)?.[1] ||
        html.match(/browser_native_hd_url":"([^"]+)"/i)?.[1] ||
        html.match(/browser_native_sd_url":"([^"]+)"/i)?.[1] ||
        html.match(/playable_url_quality_hd":"([^"]+)"/i)?.[1] ||
        html.match(/playable_url":"([^"]+)"/i)?.[1] ||
        html.match(/video_url":"([^"]+)"/i)?.[1] ||
        html.match(/"playAddr":"([^"]+)"/i)?.[1] ||
        $('video').attr('src');

      let directMediaUrl = directVideoMatch ? directVideoMatch.replace(/\\/g, '') : undefined;
      if (directMediaUrl && directMediaUrl.startsWith('//')) {
        directMediaUrl = `https:${directMediaUrl}`;
      }

      return {
        title: title ? title.trim() : undefined,
        thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : undefined,
        author: author ? author.trim() : undefined,
        directMediaUrl,
      };
    } catch {
      return {};
    }
  }

  public createRealStreamFromUrl(remoteMediaUrl: string): Promise<{ stream: Readable; contentLength: number; contentType: string } | null> {
    return new Promise((resolve) => {
      try {
        let referer = 'https://www.google.com/';
        if (remoteMediaUrl.includes('tiktok') || remoteMediaUrl.includes('tikwm')) {
          referer = 'https://www.tiktok.com/';
        } else if (remoteMediaUrl.includes('googlevideo.com') || remoteMediaUrl.includes('youtube.com') || remoteMediaUrl.includes('youtu.be')) {
          referer = 'https://www.youtube.com/';
        } else if (remoteMediaUrl.includes('facebook.com') || remoteMediaUrl.includes('fbcdn.net')) {
          referer = 'https://www.facebook.com/';
        } else if (remoteMediaUrl.includes('instagram.com') || remoteMediaUrl.includes('cdninstagram.com')) {
          referer = 'https://www.instagram.com/';
        }
        const client = remoteMediaUrl.startsWith('https') ? https : http;
        const req = client.get(
          remoteMediaUrl,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              'Accept': 'video/webm,video/mp4,video/*;q=0.9,*/*;q=0.8',
              'Referer': referer,
            },
            rejectUnauthorized: false,
          } as any,
          (res) => {
            if (res.statusCode === 200 || res.statusCode === 206) {
              const len = parseInt(res.headers['content-length'] || '0', 10);
              const type = res.headers['content-type'] || 'video/mp4';
              resolve({
                stream: res,
                contentLength: len || 5 * 1024 * 1024,
                contentType: type,
              });
            } else if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode)) {
              const redirectUrl = res.headers.location;
              if (redirectUrl) {
                this.createRealStreamFromUrl(redirectUrl).then(resolve);
              } else {
                resolve(null);
              }
            } else {
              resolve(null);
            }
          }
        );

        req.on('error', () => resolve(null));
        req.setTimeout(6000, () => {
          req.destroy();
          resolve(null);
        });
      } catch {
        resolve(null);
      }
    });
  }
}

export const realMediaExtractorService = new RealMediaExtractorService();
