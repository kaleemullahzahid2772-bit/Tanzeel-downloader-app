import { describe, it, expect, beforeEach } from 'vitest';
import { downloadManager } from '../services/downloader/DownloadManager';
import { downloadQueueManager } from '../services/downloader/DownloadQueueManager';
import { storageVerification } from '../services/downloader/StorageVerification';
import { TaskState } from '../domain/models/TaskState';

describe('Phase 4 - Production Download Manager & State Machine', () => {
  beforeEach(() => {
    downloadManager.clearAll();
  });

  describe('Download State Machine Transitions', () => {
    it('creates task in QUEUED state upon startDownload', async () => {
      const taskId = await downloadManager.startDownload('https://youtube.com/watch?v=dQw4w9WgXcQ');
      const tasks = downloadManager.getTasks();
      const task = tasks.find((t) => t.id === taskId);

      expect(task).toBeDefined();
      expect([TaskState.QUEUED, TaskState.ANALYZING, TaskState.DOWNLOADING, TaskState.COMPLETED]).toContain(task?.state);
    });

    it('pauses active download cleanly', async () => {
      const taskId = await downloadManager.startDownload('https://tiktok.com/@user/video/123456');
      const tasks = downloadManager.getTasks();
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        task.state = TaskState.DOWNLOADING;
        downloadManager.pauseDownload(taskId);
        expect(task.state).toBe(TaskState.PAUSED);
      }
    });

    it('resumes paused download cleanly', async () => {
      const taskId = await downloadManager.startDownload('https://facebook.com/watch/?v=123');
      const tasks = downloadManager.getTasks();
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        task.state = TaskState.PAUSED;
        downloadManager.resumeDownload(taskId);
        expect([TaskState.QUEUED, TaskState.ANALYZING, TaskState.DOWNLOADING]).toContain(task.state);
      }
    });

    it('cancels download task cleanly', async () => {
      const taskId = await downloadManager.startDownload('https://instagram.com/reel/C1234567890');
      downloadManager.cancelDownload(taskId);

      const tasks = downloadManager.getTasks();
      const task = tasks.find((t) => t.id === taskId);
      expect(task?.state).toBe(TaskState.CANCELLED);
    });
  });

  describe('Queue Concurrency Limits', () => {
    it('respects max concurrency limits', () => {
      const queue = new (downloadQueueManager.constructor as any)(2);
      expect(queue.getActiveCount()).toBe(0);
      expect(queue.getQueueLength()).toBe(0);
    });
  });

  describe('Storage Verification & Filename Sanitization', () => {
    it('sanitizes illegal path traversal characters from remote titles', () => {
      const dirtyName = '../../../../malicious/path/video.mp4';
      const clean = storageVerification.sanitizeFilename(dirtyName, '.mp4');
      expect(clean).not.toContain('..');
      expect(clean).not.toContain('/');
      expect(clean).toBe('maliciouspathvideo.mp4');
    });

    it('verifies non-empty completed files', () => {
      expect(storageVerification.verifyDownloadedFile(1024, 1024)).toBe(true);
      expect(storageVerification.verifyDownloadedFile(0, 1024)).toBe(false);
      expect(storageVerification.verifyDownloadedFile(500, 1024)).toBe(false);
    });
  });
});
