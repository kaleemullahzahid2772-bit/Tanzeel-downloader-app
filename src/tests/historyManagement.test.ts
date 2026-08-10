import { describe, it, expect } from 'vitest';
import { historySearchManager } from '../services/history/HistorySearchManager';
import { storageMetricsCalculator } from '../services/history/StorageMetricsCalculator';
import { storageVerification } from '../services/downloader/StorageVerification';
import type { DownloadTaskItem } from '../domain/models/DownloadTaskItem';
import { TaskState } from '../domain/models/TaskState';

describe('Phase 6 - File Management, History & Storage Metrics Tests', () => {
  const sampleTasks: DownloadTaskItem[] = [
    {
      id: '1',
      url: 'https://youtube.com/watch?v=1',
      normalizedUrl: 'https://youtube.com/watch?v=1',
      title: 'Alpha Video',
      platform: 'youtube',
      quality: '1080p',
      format: 'mp4',
      thumbnailUrl: '',
      state: TaskState.COMPLETED,
      downloadedBytes: 50 * 1024 * 1024,
      totalBytes: 50 * 1024 * 1024,
      progressPercent: 100,
      speedBytesPerSec: 0,
      etaSeconds: null,
      timestamp: '2026-08-01T10:00:00Z',
      retryCount: 0,
      maxRetries: 3,
    },
    {
      id: '2',
      url: 'https://tiktok.com/@user/video/2',
      normalizedUrl: 'https://tiktok.com/@user/video/2',
      title: 'Beta Short',
      platform: 'tiktok',
      quality: '720p',
      format: 'mp4',
      thumbnailUrl: '',
      state: TaskState.COMPLETED,
      downloadedBytes: 10 * 1024 * 1024,
      totalBytes: 10 * 1024 * 1024,
      progressPercent: 100,
      speedBytesPerSec: 0,
      etaSeconds: null,
      timestamp: '2026-08-05T10:00:00Z',
      retryCount: 0,
      maxRetries: 3,
    },
    {
      id: '3',
      url: 'https://facebook.com/watch/?v=3',
      normalizedUrl: 'https://facebook.com/watch/?v=3',
      title: 'Charlie Watch',
      platform: 'facebook',
      quality: '720p',
      format: 'mp4',
      thumbnailUrl: '',
      state: TaskState.FAILED,
      downloadedBytes: 0,
      totalBytes: 0,
      progressPercent: 0,
      speedBytesPerSec: 0,
      etaSeconds: null,
      timestamp: '2026-08-03T10:00:00Z',
      retryCount: 3,
      maxRetries: 3,
    },
  ];

  describe('HistorySearchManager', () => {
    it('filters tasks by local text search query', () => {
      const results = historySearchManager.searchAndSortTasks(sampleTasks, 'Alpha');
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('Alpha Video');
    });

    it('sorts tasks by NEWEST first', () => {
      const results = historySearchManager.searchAndSortTasks(sampleTasks, '', 'NEWEST');
      expect(results[0].id).toBe('2'); // Aug 5
    });

    it('sorts tasks by LARGEST size first', () => {
      const results = historySearchManager.searchAndSortTasks(sampleTasks, '', 'LARGEST');
      expect(results[0].id).toBe('1'); // 50MB
    });

    it('sorts tasks alphabetically A-Z', () => {
      const results = historySearchManager.searchAndSortTasks(sampleTasks, '', 'NAME_ASC');
      expect(results[0].title).toBe('Alpha Video');
      expect(results[1].title).toBe('Beta Short');
      expect(results[2].title).toBe('Charlie Watch');
    });
  });

  describe('StorageMetricsCalculator', () => {
    it('calculates real total MBs used and completed file counts', () => {
      const metrics = storageMetricsCalculator.calculateMetrics(sampleTasks);
      expect(metrics.completedFileCount).toBe(2);
      expect(metrics.failedFileCount).toBe(1);
      expect(metrics.totalSizeBytes).toBe(60 * 1024 * 1024);
      expect(metrics.totalSizeFormatted).toBe('60.0 MB');
    });
  });

  describe('Safe Filename Sanitization for Rename Option', () => {
    it('strips dangerous path traversal sequences during file rename', () => {
      const dangerousTitle = '../../../../my_new_title';
      const clean = storageVerification.sanitizeFilename(dangerousTitle, '.mp4');
      expect(clean).not.toContain('..');
      expect(clean).not.toContain('/');
      expect(clean).toBe('my_new_title.mp4');
    });
  });
});
