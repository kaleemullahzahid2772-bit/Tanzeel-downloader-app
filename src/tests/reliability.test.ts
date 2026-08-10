import { describe, it, expect } from 'vitest';
import { networkStatusService } from '../services/network/NetworkStatusService';
import { downloadManager } from '../services/downloader/DownloadManager';
import { TaskState } from '../domain/models/TaskState';

describe('Phase 7 - Client Reliability & Network State Tests', () => {
  describe('NetworkStatusService', () => {
    it('returns online state by default', () => {
      expect(networkStatusService.isOnline()).toBe(true);
    });

    it('subscribes to network status updates', () => {
      let currentStatus = false;
      const unsubscribe = networkStatusService.subscribe((online) => {
        currentStatus = online;
      });
      expect(currentStatus).toBe(true);
      unsubscribe();
    });
  });

  describe('DownloadManager State Machine Determinism', () => {
    it('prevents simultaneous COMPLETED and CANCELLED states', async () => {
      const taskId = await downloadManager.startDownload('https://youtube.com/watch?v=dQw4w9WgXcQ');
      downloadManager.cancelDownload(taskId);

      const tasks = downloadManager.getTasks();
      const task = tasks.find((t) => t.id === taskId);

      expect(task?.state).toBe(TaskState.CANCELLED);
      expect(task?.state).not.toBe(TaskState.COMPLETED);
    });
  });
});
