import type { DownloadTask } from '../models/DownloadTask';

export type DownloadHistoryTask = DownloadTask;
export type DownloadHistoryItem = DownloadTask;

export interface IDownloadHistoryRepository {
  getHistory(): Promise<DownloadTask[]>;
  addTask(task: DownloadTask): Promise<void>;
  renameTask?(id: string, newTitle: string): Promise<void>;
  removeTask(id: string): Promise<void>;
  bulkRemoveTasks?(ids: string[]): Promise<void>;
  clearHistory(): Promise<void>;
}
