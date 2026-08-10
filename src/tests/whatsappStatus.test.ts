import { describe, it, expect, beforeEach } from 'vitest';
import { whatsAppStatusProvider } from '../services/whatsapp/WhatsAppStatusProvider';
import { statusSaverService } from '../services/whatsapp/StatusSaverService';

describe('Phase 5 - WhatsApp Status Downloader Unit Tests', () => {
  beforeEach(async () => {
    await whatsAppStatusProvider.requestAccessPermission();
  });

  describe('WhatsAppStatusProvider', () => {
    it('grants permission cleanly', async () => {
      const hasPermission = await whatsAppStatusProvider.checkAccessPermission();
      expect(hasPermission).toBe(true);
    });

    it('scans available statuses and classifies IMAGE and VIDEO types', async () => {
      const statuses = await whatsAppStatusProvider.scanAvailableStatuses();
      expect(statuses.length).toBeGreaterThan(0);

      const hasImage = statuses.some((s) => s.type === 'IMAGE');
      const hasVideo = statuses.some((s) => s.type === 'VIDEO');

      expect(hasImage).toBe(true);
      expect(hasVideo).toBe(true);
    });

    it('sorts statuses newest first', async () => {
      const statuses = await whatsAppStatusProvider.scanAvailableStatuses();
      for (let i = 0; i < statuses.length - 1; i++) {
        const timeA = new Date(statuses[i].timestamp).getTime();
        const timeB = new Date(statuses[i + 1].timestamp).getTime();
        expect(timeA).toBeGreaterThanOrEqual(timeB);
      }
    });
  });

  describe('StatusSaverService & Duplicate Protection', () => {
    it('sanitizes status filenames', () => {
      const dirty = '../../../../my_status_image.jpg';
      const clean = statusSaverService.sanitizeFilename(dirty, '.jpg');
      expect(clean).not.toContain('..');
      expect(clean).not.toContain('/');
      expect(clean).toBe('my_status_image.jpg');
    });

    it('generates unique duplicate filenames cleanly', () => {
      const name1 = statusSaverService.getDuplicateSafeName('sunset', '.jpg');
      const name2 = statusSaverService.getDuplicateSafeName('sunset', '.jpg');
      const name3 = statusSaverService.getDuplicateSafeName('sunset', '.jpg');

      expect(name1).toBe('sunset.jpg');
      expect(name2).toBe('sunset (1).jpg');
      expect(name3).toBe('sunset (2).jpg');
    });
  });
});
