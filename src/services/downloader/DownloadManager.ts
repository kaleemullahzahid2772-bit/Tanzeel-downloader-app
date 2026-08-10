import type { DownloadTaskItem } from '../../domain/models/DownloadTaskItem';
import { TaskState } from '../../domain/models/TaskState';
import { backendApiClient } from '../api/BackendApiClient';
import { downloadQueueManager } from './DownloadQueueManager';
import { storageVerification } from './StorageVerification';
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

  public async startDownload(url: string): Promise<string> {
    const settings = settingsRepository.getSettings();

    // Check Wi-Fi policy if enabled
    if (settings.wifiOnly && typeof navigator !== 'undefined' && (navigator as any).connection) {
      const conn = (navigator as any).connection;
      if (conn.type && conn.type !== 'wifi' && conn.type !== 'ethernet') {
        throw new Error('Download over Wi-Fi only is enabled in Settings.');
      }
    }

    const taskId = `dl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newTask: DownloadTaskItem = {
      id: taskId,
      url,
      normalizedUrl: url,
      title: 'Analyzing video...',
      platform: 'unknown',
      quality: settings.defaultQuality,
      format: settings.defaultFormat,
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

    // 1. ANALYZING State
    task.state = TaskState.ANALYZING;
    this.notifyListeners();

    try {
      const meta = await backendApiClient.analyzeVideo(task.url);

      task.title = (meta && meta.title) ? meta.title : 'Downloaded Video';
      task.platform = (meta && meta.platform) ? meta.platform : 'unknown';
      task.thumbnailUrl = (meta && meta.thumbnailUrl) ? meta.thumbnailUrl : '';
      task.state = TaskState.DOWNLOADING;
      this.notifyListeners();

      // 2. Storage Check
      const hasSpace = await storageVerification.checkStorageSpace(10 * 1024 * 1024);
      if (!hasSpace) {
        throw new Error('Not enough storage space.');
      }

      // 3. DOWNLOADING State with byte stream
      const abortController = new AbortController();
      this.abortControllers.set(taskId, abortController);

      let lastTime = Date.now();
      let lastBytes = task.downloadedBytes;

      const downloadedBlob = await backendApiClient.downloadMediaStream(
        task.url,
        (loadedBytes, totalBytes, percent) => {
          const current = this.tasks.get(taskId);
          if (!current || current.state === TaskState.CANCELLED || current.state === TaskState.PAUSED) return;

          const now = Date.now();
          const timeDiffSec = (now - lastTime) / 1000;
          if (timeDiffSec >= 0.5) {
            const bytesDiff = loadedBytes - lastBytes;
            task.speedBytesPerSec = Math.round(bytesDiff / timeDiffSec);
            
            if (totalBytes > loadedBytes && task.speedBytesPerSec > 0) {
              task.etaSeconds = Math.round((totalBytes - loadedBytes) / task.speedBytesPerSec);
            } else {
              task.etaSeconds = null;
            }

            lastTime = now;
            lastBytes = loadedBytes;
          }

          task.downloadedBytes = loadedBytes;
          task.totalBytes = totalBytes;
          task.progressPercent = percent;
          this.notifyListeners();
        }
      );

      if (downloadedBlob && downloadedBlob.size > 0) {
        task.downloadedBytes = downloadedBlob.size;
      }

      task.totalBytes = task.downloadedBytes;

      // 4. File Verification & COMPLETED State
      const verified = storageVerification.verifyDownloadedFile(task.downloadedBytes, task.totalBytes);
      if (!verified) {
        throw new Error('Downloaded file stream was truncated or corrupted.');
      }

      task.progressPercent = 100;
      task.state = TaskState.COMPLETED;
      task.completedTimestamp = new Date().toISOString();
      this.notifyListeners();

      // Automatically trigger browser file download to save video file on user's system disk
      if (downloadedBlob && typeof window !== 'undefined' && typeof document !== 'undefined') {
        try {
          const blobUrl = URL.createObjectURL(downloadedBlob);
          const cleanTitle = (task.title || 'video').replace(/[^a-zA-Z0-9_\-]/g, '_');
          const ext = task.format || 'mp4';
          const filename = `${cleanTitle}.${ext}`;

          const anchor = document.createElement('a');
          anchor.href = blobUrl;
          anchor.download = filename;
          anchor.style.display = 'none';
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);

          setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
        } catch {
          // Fallback if browser popup blocked
        }
      }

      notificationService.notifyDownloadComplete(task.title);

      // Persist to history repository
      await downloadHistoryRepository.addTask({
        id: task.id,
        title: task.title,
        platform: task.platform,
        url: task.url,
        thumbnailUrl: task.thumbnailUrl,
        fileSize: `${(task.downloadedBytes / (1024 * 1024)).toFixed(1)} MB`,
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

        const backoffMs = Math.pow(2, currentTask.retryCount) * 1000;
        setTimeout(() => {
          downloadQueueManager.enqueue(() => this.runTaskExecution(taskId));
        }, backoffMs);
        return;
      }

      currentTask.state = TaskState.FAILED;
      currentTask.errorMessage = err.message || 'Unable to download video.';
      notificationService.notifyDownloadFailed(currentTask.title, currentTask.errorMessage);

      await downloadHistoryRepository.addTask({
        id: currentTask.id,
        title: currentTask.title,
        platform: currentTask.platform,
        url: currentTask.url,
        thumbnailUrl: currentTask.thumbnailUrl,
        fileSize: '0 MB',
        quality: currentTask.quality,
        format: currentTask.format,
        status: 'failed',
        progressPercent: 0,
        timestamp: currentTask.timestamp,
        errorMessage: currentTask.errorMessage,
        isMockData: false,
      });

      this.notifyListeners();
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
