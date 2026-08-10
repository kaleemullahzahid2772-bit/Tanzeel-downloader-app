import { describe, it, expect } from 'vitest';
import { mediaExtractorService } from '../src/services/MediaExtractorService';
import { tempFileManager } from '../src/services/TempFileManager';

describe('Phase 3 - Backend API & Media Extractor Integration Tests', () => {
  describe('MediaExtractorService', () => {
    it('analyzes YouTube URL correctly', async () => {
      const meta = await mediaExtractorService.analyzeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(meta.platform).toBe('youtube');
      expect(meta.title).toBeTruthy();
      expect(meta.formats.length).toBeGreaterThan(0);
    });

    it('analyzes TikTok URL correctly', async () => {
      const meta = await mediaExtractorService.analyzeUrl('https://www.tiktok.com/@user/video/123456');
      expect(meta.platform).toBe('tiktok');
      expect(meta.title).toBeTruthy();
    });

    it('analyzes Facebook URL correctly', async () => {
      const meta = await mediaExtractorService.analyzeUrl('https://www.facebook.com/watch/?v=123456');
      expect(meta.platform).toBe('facebook');
      expect(meta.title).toBeTruthy();
    });

    it('analyzes Instagram URL correctly', async () => {
      const meta = await mediaExtractorService.analyzeUrl('https://www.instagram.com/reel/C123456/');
      expect(meta.platform).toBe('instagram');
      expect(meta.title).toBeTruthy();
    });

    it('rejects empty URL input', async () => {
      await expect(mediaExtractorService.analyzeUrl('')).rejects.toThrow('Paste a video link to continue.');
    });

    it('analyzes generic/unsupported domain with fallback adapter', async () => {
      const meta = await mediaExtractorService.analyzeUrl('https://unsupporteddomain123.com/video');
      expect(meta.platform).toBe('unknown');
      expect(meta.platformName).toBe('unsupporteddomain123.com');
    });
  });

  describe('TempFileManager & Filename Sanitization', () => {
    it('sanitizes dangerous path traversal filenames', () => {
      const dangerousName = '../../../../etc/passwd';
      const clean = tempFileManager.sanitizeFilename(dangerousName, '.mp4');
      expect(clean).not.toContain('..');
      expect(clean).not.toContain('/');
      expect(clean).toBe('etcpasswd.mp4');
    });

    it('handles special characters safely', () => {
      const specialName = 'video <title> *special* | test';
      const clean = tempFileManager.sanitizeFilename(specialName, '.mp4');
      expect(clean).not.toContain('<');
      expect(clean).not.toContain('>');
      expect(clean).not.toContain('*');
      expect(clean).not.toContain('|');
    });
  });
});
