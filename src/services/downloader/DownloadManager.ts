import type { DownloadTaskItem } from '../../domain/models/DownloadTaskItem';
import { TaskState } from '../../domain/models/TaskState';
import { backendApiClient } from '../api/BackendApiClient';
import { downloadQueueManager } from './DownloadQueueManager';
import { notificationService } from '../notifications/NotificationService';
import { downloadHistoryRepository } from '../../data/repositories/DownloadHistoryRepositoryImpl';
import { settingsRepository } from '../../data/repositories/SettingsRepositoryImpl';

type TaskUpdateListener = (tasks: DownloadTaskItem[]) => void;

export class DownloadManager {
  private tasks: Map<string, DownloadTaskItem> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();
  ariaListeners: Set<TaskUpdateListener> = new Set();

  constructor() {
    this.loadPersistedTasks();
  }

  private async loadPersistedTasks() {
    const history = await downloadHistoryRepository.getHistory();
    history.forEach((t) => {
      this.tasks.set(t.id, {
        id: t.id,
        url: t.url,
        normalizedUrl: t.url,
        title: t.title,
        platform: t.platform,
        quality: t.quality,
        format: t.format,
        thumbnailUrl: t.thumbnailUrl,
        state: (t.status.toUpperCase() as TaskState) || TaskState.COMPLETED,
        downloadedBytes: t.status === 'completed' ? 10 * 1024 * 1024 : 0,
        totalBytes: 10 * 1024 * 1024,
        progressPercent: t.progressPercent,
        speedBytesPerSec: 0,
        etaSeconds: null,
        timestamp: t.timestamp,
        retryCount: 0,
        maxRetries: 3,
      });
    });
    this.notifyListeners();
  }

  public subscribe(listener: TaskUpdateListener): () => void {
    this.ariaListeners.add(listener);
    listener(Array.from(this.tasks.values()));
    return () => this.ariaListeners.delete(listener);
  }

  private notifyListeners(): void {
    const list = Array.from(this.tasks.values());
    this.ariaListeners.forEach((fn) => fn(list));
  }

  public getTasks(): DownloadTaskItem[] {
    return Array.from(this.tasks.values());
  }

  public async startDownload(
    url: string,
    options?: { quality?: string; format?: 'mp4' | 'mp3' }
  ): Promise<string> {
    const settings = settingsRepository.getSettings();

    // Check Wi-Fi policy if enabled
    if (settings.wifiOnly && typeof navigator !== 'undefined' && (navigator as any).connection) {
      const conn = (navigator as any).connection;
      if (conn.type && conn.type !== 'wifi' && conn.type !== 'ethernet') {
        throw new Error('Download over Wi-Fi only is enabled in Settings.');
      }
    }

    const taskId = `dl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const chosenQuality = options?.quality || settings.defaultQuality;
    const chosenFormat = options?.format || settings.defaultFormat;

    const newTask: DownloadTaskItem = {
      id: taskId,
      url,
      normalizedUrl: url,
      title: 'Starting download...',
      platform: 'unknown',
      quality: chosenQuality,
      format: chosenFormat,
      thumbnailUrl: '',
      state: TaskState.QUEUED,
      downloadedBytes: 0,
      totalBytes: 0,
      progressPercent: 0,
      speedBytesPerSec: 0,
      etaSeconds: null,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 3,
    };

    this.tasks.set(taskId, newTask);
    this.notifyListeners();

    downloadQueueManager.enqueue(() => this.runTaskExecution(taskId));
    return taskId;
  }

  private async runTaskExecution(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task || task.state === TaskState.CANCELLED || task.state === TaskState.PAUSED) {
      return;
    }

    task.state = TaskState.DOWNLOADING;
    task.progressPercent = 20;
    this.notifyListeners();

    try {
      const isAudio = task.format === 'mp3' || task.quality?.toLowerCase().includes('audio') || task.quality?.toLowerCase().includes('mp3');
      const ext = isAudio ? 'mp3' : 'mp4';
      const cleanTitle = (task.title && task.title !== 'Starting download...') ? task.title.replace(/[^a-zA-Z0-9_\-]/g, '_') : 'video_download';
      const filename = `${cleanTitle}.${ext}`;

      let lastTime = Date.now();
      let lastBytes = 0;

      // Safe in-app streaming download via POST to prevent any 'Cannot GET' navigation
      const downloadedBlob = await backendApiClient.downloadMediaStream(
        task.url,
        task.quality,
        (loadedBytes, totalBytes, percent) => {
          const current = this.tasks.get(taskId);
          if (!current || current.state === TaskState.CANCELLED || current.state === TaskState.PAUSED) return;

          const now = Date.now();
          const timeDiffSec = (now - lastTime) / 1000;
          if (timeDiffSec >= 0.5) {
            const bytesDiff = loadedBytes - lastBytes;
            task.speedBytesPerSec = Math.round(bytesDiff / timeDiffSec);
            lastTime = now;
            lastBytes = loadedBytes;
          }

          task.downloadedBytes = loadedBytes;
          task.totalBytes = totalBytes;
          task.progressPercent = Math.max(percent, 25);
          this.notifyListeners();
        }
      );

      if (downloadedBlob && typeof window !== 'undefined' && typeof document !== 'undefined') {
        const isNativeHandled = downloadedBlob.size === 'browser-download-initiated'.length;
        if (!isNativeHandled) {
          if (!downloadedBlob.size || downloadedBlob.size < 1000) {
            throw new Error('Downloaded file is incomplete or corrupted (0 bytes received).');
          }
          const blobUrl = URL.createObjectURL(downloadedBlob);
          const anchor = document.createElement('a');
          anchor.href = blobUrl;
          anchor.download = filename;
          anchor.style.display = 'none';
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 20000);
        }
      }

      task.progressPercent = 100;
      task.state = TaskState.COMPLETED;
      task.completedTimestamp = new Date().toISOString();
      this.notifyListeners();

      notificationService.notifyDownloadComplete(task.title || 'Video');

      // Persist to history repository
      await downloadHistoryRepository.addTask({
        id: task.id,
        title: task.title || 'Video Download',
        platform: task.platform,
        url: task.url,
        thumbnailUrl: task.thumbnailUrl,
        fileSize: isAudio ? '5.2 MB' : '22.0 MB',
        quality: task.quality,
        format: task.format,
        status: 'completed',
        progressPercent: 100,
        timestamp: task.timestamp,
        isMockData: false,
      });

      this.notifyListeners();
    } catch (err: any) {
      const currentTask = this.tasks.get(taskId);
      if (!currentTask || currentTask.state === TaskState.CANCELLED || currentTask.state === TaskState.PAUSED) {
        return;
      }

      // Retry logic for transient failures
      if (currentTask.retryCount < currentTask.maxRetries) {
        currentTask.retryCount++;
        currentTask.state = TaskState.QUEUED;
        this.notifyListeners();
        setTimeout(() => {
          downloadQueueManager.enqueue(() => this.runTaskExecution(taskId));
        }, 1500);
      } else {
        currentTask.state = TaskState.FAILED;
        currentTask.errorMessage = err.message || 'Download failed.';
        this.notifyListeners();
      }
    } finally {
      this.abortControllers.delete(taskId);
    }
  }

  public pauseDownload(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task || task.state !== TaskState.DOWNLOADING) return;

    task.state = TaskState.PAUSED;
    const controller = this.abortControllers.get(taskId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(taskId);
    }
    this.notifyListeners();
  }

  public resumeDownload(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task || task.state !== TaskState.PAUSED) return;

    task.state = TaskState.QUEUED;
    this.notifyListeners();
    downloadQueueManager.enqueue(() => this.runTaskExecution(taskId));
  }

  public cancelDownload(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const controller = this.abortControllers.get(taskId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(taskId);
    }

    task.state = TaskState.CANCELLED;
    this.notifyListeners();
  }

  public retryDownload(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.retryCount = 0;
    task.errorMessage = undefined;
    task.state = TaskState.QUEUED;
    this.notifyListeners();
    downloadQueueManager.enqueue(() => this.runTaskExecution(taskId));
  }

  public removeTask(taskId: string): void {
    this.cancelDownload(taskId);
    this.tasks.delete(taskId);
    downloadHistoryRepository.removeTask(taskId);
    this.notifyListeners();
  }

  public clearAll(): void {
    this.tasks.forEach((t) => this.cancelDownload(t.id));
    this.tasks.clear();
    downloadHistoryRepository.clearHistory();
    this.notifyListeners();
  }
}

export const downloadManager = new DownloadManager();
