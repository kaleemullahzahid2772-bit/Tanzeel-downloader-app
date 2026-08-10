import { describe, it, expect } from 'vitest';
import { ssrfProtectionService } from '../src/services/security/SsrfProtectionService';
import { tempFileManager } from '../src/services/TempFileManager';

describe('Phase 7 - Backend Security & SSRF Protection Tests', () => {
  describe('SsrfProtectionService', () => {
    it('blocks localhost SSRF attempts', () => {
      const res = ssrfProtectionService.validateUrl('http://localhost:4000/admin');
      expect(res.isSafe).toBe(false);
      expect(res.errorMessage).toBe('This video link target is restricted.');
    });

    it('blocks 127.0.0.1 loopback SSRF attempts', () => {
      const res = ssrfProtectionService.validateUrl('http://127.0.0.1/secret');
      expect(res.isSafe).toBe(false);
      expect(res.errorMessage).toBe('This video link target is restricted.');
    });

    it('blocks AWS/GCP cloud metadata IP (169.254.169.254)', () => {
      const res = ssrfProtectionService.validateUrl('http://169.254.169.254/latest/meta-data');
      expect(res.isSafe).toBe(false);
      expect(res.errorMessage).toBe('This video link target is restricted.');
    });

    it('blocks private IPv4 addresses (10.x, 172.16.x, 192.168.x)', () => {
      expect(ssrfProtectionService.validateUrl('http://10.0.0.1/internal').isSafe).toBe(false);
      expect(ssrfProtectionService.validateUrl('http://172.16.0.5/api').isSafe).toBe(false);
      expect(ssrfProtectionService.validateUrl('http://192.168.1.1/router').isSafe).toBe(false);
    });

    it('blocks dangerous URL schemes (javascript:, file:, data:, ftp:)', () => {
      expect(ssrfProtectionService.validateUrl('javascript:alert(1)').isSafe).toBe(false);
      expect(ssrfProtectionService.validateUrl('file:///etc/passwd').isSafe).toBe(false);
      expect(ssrfProtectionService.validateUrl('data:text/html,<h1>Hack</h1>').isSafe).toBe(false);
      expect(ssrfProtectionService.validateUrl('ftp://example.com/file').isSafe).toBe(false);
    });

    it('blocks embedded credential URLs (http://admin:pass@example.com)', () => {
      const res = ssrfProtectionService.validateUrl('http://admin:pass@example.com/video');
      expect(res.isSafe).toBe(false);
      expect(res.errorMessage).toBe('The video link contains invalid credentials.');
    });

    it('allows valid public HTTPS video URLs', () => {
      const res = ssrfProtectionService.validateUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(res.isSafe).toBe(true);
    });
  });

  describe('Path Traversal Security', () => {
    it('sanitizes dangerous path traversal filenames', () => {
      const dangerous = '../../../../var/www/html/exploit.mp4';
      const clean = tempFileManager.sanitizeFilename(dangerous, '.mp4');
      expect(clean).not.toContain('..');
      expect(clean).not.toContain('/');
      expect(clean).toBe('varwwwhtmlexploit.mp4');
    });
  });
});
