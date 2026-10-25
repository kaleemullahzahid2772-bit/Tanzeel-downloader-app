import { describe, it, expect } from 'vitest';
import { videoSourceAnalyzerService } from '../services/VideoSourceAnalyzerService';
import { PlatformType } from '../domain/models/PlatformType';

describe('Phase 2 - URL Validator, Normalizer, and Platform Detector', () => {
  // 1. YouTube Tests
  describe('YouTube Detection & Video ID Extraction', () => {
    it('detects standard YouTube watch URL', async () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const result = await videoSourceAnalyzerService.analyze(url);
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe(PlatformType.YOUTUBE);
      expect(result.platformName).toBe('YouTube');
      expect(result.videoId).toBe('dQw4w9WgXcQ');
    });

    it('detects youtu.be short URL', async () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ?si=abcdef';
      const result = await videoSourceAnalyzerService.analyze(url);
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe(PlatformType.YOUTUBE);
      expect(result.videoId).toBe('dQw4w9WgXcQ');
    });

    it('detects YouTube Shorts URL', async () => {
      const url = 'https://youtube.com/shorts/abcdef12345';
      const result = await videoSourceAnalyzerService.analyze(url);
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe(PlatformType.YOUTUBE);
      expect(result.videoId).toBe('abcdef12345');
    });

    it('detects YouTube Live URL', async () => {
      const url = 'https://www.youtube.com/live/livestream123';
      const result = await videoSourceAnalyzerService.analyze(url);
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe(PlatformType.YOUTUBE);
      expect(result.videoId).toBe('livestream123');
    });
  });

  // 2. TikTok Tests
  describe('TikTok Detection & Video ID Extraction', () => {
    it('detects standard TikTok video URL', async () => {
      const url = 'https://www.tiktok.com/@creator/video/7123456789012345678';
      const result = await videoSourceAnalyzerService.analyze(url);
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe(PlatformType.TIKTOK);
      expect(result.platformName).toBe('TikTok');
      expect(result.videoId).toBe('7123456789012345678');
    });

    it('detects vm.tiktok.com short URL', async () => {
      const url = 'https://vm.tiktok.com/ZM8xABC12/';
      const result = await videoSourceAnalyzerService.analyze(url);
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe(PlatformType.TIKTOK);
    });

    it('detects vt.tiktok.com short URL', async () => {
      const url = 'https://vt.tiktok.com/ZS8xABC34/';
      const result = await videoSourceAnalyzerService.analyze(url);
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe(PlatformType.TIKTOK);
    });
  });

  // 3. Facebook Tests
  describe('Facebook Detection & Video ID Extraction', () => {
    it('detects Facebook watch URL', async () => {
      const url = 'https://www.facebook.com/watch/?v=1015849382910';
      const result = await videoSourceAnalyzerService.analyze(url);
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe(PlatformType.FACEBOOK);
      expect(result.platformName).toBe('Facebook');
      expect(result.videoId).toBe('1015849382910');
    });

    it('detects fb.watch URL', async () => {
      const url = 'https://fb.watch/abcd12345/';
      const result = await videoSourceAnalyzerService.analyze(url);
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe(PlatformType.FACEBOOK);
    });

    it('detects mobile m.facebook.com video URL', async () => {
      const url = 'https://m.facebook.com/watch/?v=987654321';
      const result = await videoSourceAnalyzerService.analyze(url);
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe(PlatformType.FACEBOOK);
      expect(result.videoId).toBe('987654321');
    });
  });

  // 4. Instagram Tests
  describe('Instagram Detection & Video ID Extraction', () => {
    it('detects Instagram Reel URL', async () => {
      const url = 'https://www.instagram.com/reel/C1234567890/';
      const result = await videoSourceAnalyzerService.analyze(url);
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe(PlatformType.INSTAGRAM);
      expect(result.platformName).toBe('Instagram');
      expect(result.videoId).toBe('C1234567890');
    });

    it('detects Instagram Post URL', async () => {
      const url = 'https://instagram.com/p/B9876543210/';
      const result = await videoSourceAnalyzerService.analyze(url);
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe(PlatformType.INSTAGRAM);
      expect(result.videoId).toBe('B9876543210');
    });

    it('detects Instagram TV URL', async () => {
      const url = 'https://instagram.com/tv/A1122334455/';
      const result = await videoSourceAnalyzerService.analyze(url);
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe(PlatformType.INSTAGRAM);
      expect(result.videoId).toBe('A1122334455');
    });
  });

  // 5. Pinterest Tests
  describe('Pinterest Detection & Video ID Extraction', () => {
    it('detects standard Pinterest pin URL', async () => {
      const url = 'https://www.pinterest.com/pin/123456789012345678/';
      const result = await videoSourceAnalyzerService.analyze(url);
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe(PlatformType.PINTEREST);
      expect(result.platformName).toBe('Pinterest');
      expect(result.videoId).toBe('123456789012345678');
    });

    it('detects pin.it short URL', async () => {
      const url = 'https://pin.it/abcd123';
      const result = await videoSourceAnalyzerService.analyze(url);
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe(PlatformType.PINTEREST);
      expect(result.platformName).toBe('Pinterest');
    });
  });

  // 6. Invalid / Edge Cases Tests
  describe('Invalid Inputs & Edge Cases', () => {
    it('handles empty string', async () => {
      const result = await videoSourceAnalyzerService.analyze('');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Paste a video link to continue.');
    });

    it('handles random non-URL text', async () => {
      const result = await videoSourceAnalyzerService.analyze('hello world');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('The video link appears to be invalid.');
    });

    it('handles whitespace padding around URL', async () => {
      const url = '   https://youtube.com/watch?v=dQw4w9WgXcQ   ';
      const result = await videoSourceAnalyzerService.analyze(url);
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe(PlatformType.YOUTUBE);
      expect(result.normalizedUrl).toContain('youtube.com');
    });

    it('handles unsupported generic domain', async () => {
      const url = 'https://example.com/somevideo.mp4';
      const result = await videoSourceAnalyzerService.analyze(url);
      expect(result.isValid).toBe(true);
      expect(result.platform).toBe(PlatformType.UNKNOWN);
      expect(result.errorMessage).toBe('This video platform is not supported yet.');
    });

    it('prevents multiple URLs in single input', async () => {
      const url = 'https://youtube.com/watch?v=123 https://tiktok.com/@user/video/456';
      const result = await videoSourceAnalyzerService.analyze(url);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Please enter one video link at a time.');
    });
  });
});
